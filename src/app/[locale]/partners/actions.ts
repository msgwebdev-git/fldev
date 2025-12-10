"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitPartnerApplication(formData: FormData) {
  try {
    const supabase = await createClient();

    // Extract form data
    const contactName = formData.get("contactName") as string;
    const email = formData.get("email") as string;
    const companyName = formData.get("companyName") as string;
    const website = formData.get("website") as string;
    const category = formData.get("category") as string;
    const message = formData.get("message") as string;
    const logo = formData.get("logo") as File | null;

    // Validate required fields
    if (!contactName || !email || !companyName || !category || !message) {
      return {
        success: false,
        error: "All required fields must be filled",
      };
    }

    let logoUrl: string | null = null;

    // Upload logo if provided
    if (logo && logo.size > 0) {
      const fileExt = logo.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `partnership-logos/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("partners")
        .upload(filePath, logo, {
          contentType: logo.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Logo upload error:", uploadError);
        return {
          success: false,
          error: "Failed to upload logo",
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("partners")
        .getPublicUrl(uploadData.path);

      logoUrl = urlData.publicUrl;
    }

    // Insert partnership request
    const { error: insertError } = await supabase
      .from("partnership_requests")
      .insert({
        contact_name: contactName,
        email,
        company_name: companyName,
        website: website || null,
        category,
        message,
        logo_url: logoUrl,
        status: "pending",
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return {
        success: false,
        error: "Failed to submit application",
      };
    }

    // Revalidate the partners page
    revalidatePath("/partners");

    // TODO: Send email notification to admin
    // await sendEmailNotification({ contactName, email, companyName });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Partnership application error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

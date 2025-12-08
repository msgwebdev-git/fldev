"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";
import { Upload, X, Check, Loader2, Image as ImageIcon, Trash2, AlertCircle, CheckSquare, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "compressing" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  thumbnailBlob?: Blob;
  fullBlob?: Blob;
}

interface ExistingPhoto {
  id: number;
  year: string;
  filename: string;
  alt_text: string | null;
  thumbnailUrl: string;
  fullUrl: string;
}

export default function GalleryAdminPage() {
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear().toString());
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [existingPhotos, setExistingPhotos] = React.useState<ExistingPhoto[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = React.useState(false);
  const [photoToDelete, setPhotoToDelete] = React.useState<ExistingPhoto | null>(null);
  const [selectedPhotos, setSelectedPhotos] = React.useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("upload");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const years = ["2025", "2024", "2023", "2022", "2021"];

  // Load existing photos when year or tab changes
  React.useEffect(() => {
    if (activeTab === "manage") {
      loadExistingPhotos();
      setSelectedPhotos(new Set()); // Clear selection when changing year
    }
  }, [selectedYear, activeTab]);

  // Load existing photos
  const loadExistingPhotos = async () => {
    setIsLoadingPhotos(true);
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("year", selectedYear)
        .order("display_order", { ascending: true });

      if (error) throw error;

      const photos: ExistingPhoto[] = (data || []).map((photo) => ({
        id: photo.id,
        year: photo.year,
        filename: photo.filename,
        alt_text: photo.alt_text,
        thumbnailUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${photo.year}/thumbnails/${photo.filename}.webp`,
        fullUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${photo.year}/full/${photo.filename}.webp`,
      }));

      setExistingPhotos(photos);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (photo: ExistingPhoto) => {
    try {
      const response = await fetch(
        `/api/admin/gallery/delete?id=${photo.id}&year=${photo.year}&filename=${photo.filename}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Delete failed");

      // Remove from state
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setPhotoToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete photo");
    }
  };

  // Toggle photo selection
  const togglePhotoSelection = (photoId: number) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  // Select all photos
  const selectAll = () => {
    setSelectedPhotos(new Set(existingPhotos.map((p) => p.id)));
  };

  // Deselect all photos
  const deselectAll = () => {
    setSelectedPhotos(new Set());
  };

  // Delete selected photos
  const handleDeleteSelected = async () => {
    if (selectedPhotos.size === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedPhotos.size} photo(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const photosToDelete = existingPhotos.filter((p) =>
        selectedPhotos.has(p.id)
      );

      // Delete in parallel (max 5 at a time)
      const batchSize = 5;
      for (let i = 0; i < photosToDelete.length; i += batchSize) {
        const batch = photosToDelete.slice(i, i + batchSize);
        await Promise.all(
          batch.map((photo) =>
            fetch(
              `/api/admin/gallery/delete?id=${photo.id}&year=${photo.year}&filename=${photo.filename}`,
              { method: "DELETE" }
            )
          )
        );
      }

      // Remove from state
      setExistingPhotos((prev) =>
        prev.filter((p) => !selectedPhotos.has(p.id))
      );
      setSelectedPhotos(new Set());
    } catch (error) {
      console.error("Batch delete error:", error);
      alert("Failed to delete some photos");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    addFiles(droppedFiles);
  };

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  // Add files to state
  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  // Remove file
  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  // Compress single image
  const compressImage = async (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number
  ): Promise<Blob> => {
    const options = {
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      useWebWorker: true,
      fileType: "image/webp" as const,
      initialQuality: quality,
    };

    return await imageCompression(file, options);
  };

  // Upload single file
  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      // Update status to compressing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "compressing", progress: 10 } : f
        )
      );

      // Compress thumbnail (400x300)
      const thumbnailBlob = await compressImage(uploadFile.file, 400, 300, 0.85);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, progress: 40, thumbnailBlob } : f
        )
      );

      // Compress full (1920x1440)
      const fullBlob = await compressImage(uploadFile.file, 1920, 1440, 0.85);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "uploading", progress: 70, fullBlob }
            : f
        )
      );

      // Prepare form data
      const formData = new FormData();
      const filename = uploadFile.file.name.replace(/\.[^/.]+$/, "");

      formData.append("thumbnail", thumbnailBlob, `${filename}.webp`);
      formData.append("full", fullBlob, `${filename}.webp`);
      formData.append("year", selectedYear);
      formData.append("filename", filename);
      formData.append("width", "1920");
      formData.append("height", "1440");

      // Upload to API
      const response = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      // Success
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "success", progress: 100 } : f
        )
      );
    } catch (error) {
      console.error("Upload error:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error", error: "Upload failed" }
            : f
        )
      );
    }
  };

  // Upload all files
  const handleUploadAll = async () => {
    setIsUploading(true);

    const pendingFiles = files.filter((f) => f.status === "pending");

    // Upload 3 files at a time
    const batchSize = 3;
    for (let i = 0; i < pendingFiles.length; i += batchSize) {
      const batch = pendingFiles.slice(i, i + batchSize);
      await Promise.all(batch.map((file) => uploadFile(file)));
    }

    setIsUploading(false);
  };

  // Clear completed
  const clearCompleted = () => {
    setFiles((prev) => {
      const toRemove = prev.filter((f) => f.status === "success" || f.status === "error");
      toRemove.forEach((f) => URL.revokeObjectURL(f.preview));
      return prev.filter((f) => f.status !== "success" && f.status !== "error");
    });
  };

  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === "pending").length,
    uploading: files.filter(
      (f) => f.status === "compressing" || f.status === "uploading"
    ).length,
    success: files.filter((f) => f.status === "success").length,
    error: files.filter((f) => f.status === "error").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gallery Management</h1>
        <p className="text-muted-foreground">
          Upload and manage festival photos with automatic compression
        </p>
      </div>

      {/* Year Selection */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <label className="font-medium">Select Year:</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upload">Upload Photos</TabsTrigger>
          <TabsTrigger value="manage">
            Manage Photos ({existingPhotos.length})
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6 mt-6">

      {/* Drop Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-muted"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="p-12 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Drag & drop photos here
          </h3>
          <p className="text-muted-foreground mb-4">
            or click to browse (JPG, PNG supported)
          </p>
          <Button variant="outline">Choose Files</Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </Card>

      {/* Stats */}
      {files.length > 0 && (
        <div className="grid grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.uploading}</div>
            <div className="text-sm text-muted-foreground">Uploading</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <div className="text-sm text-muted-foreground">Success</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </Card>
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex gap-2">
          <Button
            onClick={handleUploadAll}
            disabled={isUploading || stats.pending === 0}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>Upload {stats.pending} Photos</>
            )}
          </Button>
          <Button variant="outline" onClick={clearCompleted}>
            Clear Completed
          </Button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="relative overflow-hidden">
              {/* Preview Image */}
              <div className="aspect-square relative bg-muted">
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-full h-full object-cover"
                />

                {/* Status Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  {file.status === "pending" && (
                    <ImageIcon className="h-8 w-8 text-white/80" />
                  )}
                  {(file.status === "compressing" || file.status === "uploading") && (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  )}
                  {file.status === "success" && (
                    <Check className="h-8 w-8 text-green-500" />
                  )}
                  {file.status === "error" && (
                    <X className="h-8 w-8 text-red-500" />
                  )}
                </div>

                {/* Remove Button */}
                {file.status === "pending" && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 p-1 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {(file.status === "compressing" || file.status === "uploading") && (
                <div className="p-2">
                  <Progress value={file.progress} className="h-1" />
                  <div className="text-xs text-center mt-1 text-muted-foreground">
                    {file.status === "compressing" ? "Compressing..." : "Uploading..."}
                  </div>
                </div>
              )}

              {/* File Name */}
              <div className="p-2 text-xs truncate text-center">
                {file.file.name}
              </div>
            </Card>
          ))}
        </div>
      )}
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="space-y-6 mt-6">
          {isLoadingPhotos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : existingPhotos.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload photos for {selectedYear} to see them here
                </p>
                <Button onClick={() => setActiveTab("upload")}>
                  Go to Upload
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Stats & Actions */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold">{existingPhotos.length}</div>
                    <div className="text-muted-foreground">
                      Photos in {selectedYear}
                      {selectedPhotos.size > 0 && (
                        <span className="ml-2 text-primary">
                          ({selectedPhotos.size} selected)
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={loadExistingPhotos}
                    disabled={isLoadingPhotos}
                  >
                    Refresh
                  </Button>
                </div>

                {/* Selection Actions */}
                <div className="flex gap-2">
                  {selectedPhotos.size === 0 ? (
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Select All
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={deselectAll}>
                        <Square className="h-4 w-4 mr-2" />
                        Deselect All
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelected}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected ({selectedPhotos.size})
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </Card>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {existingPhotos.map((photo) => {
                  const isSelected = selectedPhotos.has(photo.id);
                  return (
                    <Card
                      key={photo.id}
                      className={cn(
                        "relative overflow-hidden group cursor-pointer transition-all",
                        isSelected && "ring-2 ring-primary"
                      )}
                      onClick={() => togglePhotoSelection(photo.id)}
                    >
                      {/* Photo */}
                      <div className="aspect-square relative bg-muted">
                        <img
                          src={photo.thumbnailUrl}
                          alt={photo.alt_text || photo.filename}
                          className="w-full h-full object-cover"
                        />

                        {/* Selection Checkbox */}
                        <div
                          className={cn(
                            "absolute top-2 left-2 w-6 h-6 rounded flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
                          )}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </div>

                        {/* Hover Overlay with Delete */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoToDelete(photo);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>

                        {/* Selected Overlay */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                        )}
                      </div>

                      {/* Filename */}
                      <div className="p-2 text-xs truncate text-center">
                        {photo.filename}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Photo?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{photoToDelete?.filename}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => photoToDelete && handleDeletePhoto(photoToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

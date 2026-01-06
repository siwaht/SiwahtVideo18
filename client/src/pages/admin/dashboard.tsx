import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mediaCategories, type Media } from "@shared/schema";
import {
  LogOut,
  Upload,
  Edit,
  Trash2,
  Film,
  Music,
  Calendar,
  HardDrive,
  Clock,
  Home,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedFileType, setSelectedFileType] = useState<'video' | 'audio' | null>(null);

  // Check authentication
  useEffect(() => {
    fetch("/api/admin/check-auth", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          setLocation("/admin");
        }
      });
  }, [setLocation]);

  // Fetch media data
  const { data: mediaList, isLoading } = useQuery<Media[]>({
    queryKey: ["/api/admin/media"],
    queryFn: async () => {
      const response = await fetch("/api/admin/media", {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) {
          setLocation("/admin");
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch media");
      }
      return response.json();
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      return response.json();
    },
    onSuccess: () => {
      setLocation("/admin");
    },
  });

  // Update media mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      toast({ title: "Success", description: "Media updated successfully" });
      setShowEditDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update media",
        variant: "destructive",
      });
    },
  });

  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      toast({ title: "Success", description: "Media deleted successfully" });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      });
    },
  });

  // Handle file upload
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    // Check file type
    const isVideo = file.type.startsWith("video/");
    const isAudio = file.type.startsWith("audio/");

    if (!isVideo && !isAudio) {
      toast({
        title: "Error",
        description: "Please select a valid video or audio file",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    try {
      // Prepare upload data
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("title", formData.get("title") as string);
      uploadData.append("category", formData.get("category") as string);
      
      const description = formData.get("description") as string;
      if (description) uploadData.append("description", description);
      
      // Add audio metadata if it's an audio file
      if (selectedFileType === 'audio') {
        const audioMetadata: any = {};
        
        if (selectedCategory === "Professional Multilingual Voice Ads") {
          const language = formData.get("language") as string;
          const gender = formData.get("gender") as string;
          const accent = formData.get("accent") as string;
          const ageRange = formData.get("ageRange") as string;
          
          if (language) audioMetadata.language = language;
          if (gender) audioMetadata.gender = gender;
          if (accent) audioMetadata.accent = accent;
          if (ageRange) audioMetadata.ageRange = ageRange;
        } else if (selectedCategory === "AI Podcast Production") {
          const episodeType = formData.get("episodeType") as string;
          const tags = formData.get("tags") as string;
          const hostName = formData.get("hostName") as string;
          const guestName = formData.get("guestName") as string;
          
          if (episodeType) audioMetadata.episodeType = episodeType;
          if (tags) audioMetadata.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
          if (hostName) audioMetadata.hostName = hostName;
          if (guestName) audioMetadata.guestName = guestName;
        }
        
        if (Object.keys(audioMetadata).length > 0) {
          uploadData.append("audioMetadata", JSON.stringify(audioMetadata));
        }
      }
      
      // Show progress updates
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        credentials: "include",
        body: uploadData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
        toast({
          title: "Success",
          description: "Media uploaded and processed successfully",
        });
        setShowUploadDialog(false);
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedCategory("");
      setSelectedFileType(null);
    }
  };

  // Format file size
  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format duration
  const formatDuration = (seconds?: string | null) => {
    if (!seconds) return "-";
    const sec = parseInt(seconds);
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Dashboard - Media Management
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              data-testid="button-view-site"
            >
              <Home className="h-4 w-4 mr-2" />
              View Site
            </Button>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Media Library ({mediaList?.length || 0} items)
          </h2>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setShowUploadDialog(true)}
            data-testid="button-upload"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Media
          </Button>
        </div>

        {/* Media Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading media...
                  </TableCell>
                </TableRow>
              ) : mediaList?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No media uploaded yet
                  </TableCell>
                </TableRow>
              ) : (
                mediaList?.map((media) => (
                  <TableRow key={media.id}>
                    <TableCell className="font-medium">{media.title}</TableCell>
                    <TableCell>{media.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {media.fileType === "video" ? (
                          <Film className="h-4 w-4 mr-2 text-blue-600" />
                        ) : (
                          <Music className="h-4 w-4 mr-2 text-green-600" />
                        )}
                        {media.fileType}
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(media.fileSize)}</TableCell>
                    <TableCell>{formatDuration(media.duration)}</TableCell>
                    <TableCell>
                      {format(new Date(media.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMedia(media);
                            setShowEditDialog(true);
                          }}
                          data-testid={`button-edit-${media.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedMedia(media);
                            setShowDeleteDialog(true);
                          }}
                          data-testid={`button-delete-${media.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={(open) => {
        setShowUploadDialog(open);
        if (!open) {
          setSelectedCategory("");
          setSelectedFileType(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Media</DialogTitle>
            <DialogDescription>
              Upload a video or audio file. It will be automatically compressed for web.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="Enter media title"
                  disabled={isUploading}
                  data-testid="input-upload-title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  name="category" 
                  required 
                  disabled={isUploading}
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger data-testid="select-upload-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediaCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept="video/*,audio/*"
                  required
                  disabled={isUploading}
                  data-testid="input-upload-file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFileType(file.type.startsWith('audio') ? 'audio' : 'video');
                    }
                  }}
                />
                <p className="text-sm text-slate-500 mt-1">
                  Accepted formats: MP4, MOV, WEBM, MP3, WAV
                </p>
              </div>
              
              {/* Description field */}
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Enter a description"
                  disabled={isUploading}
                  data-testid="input-upload-description"
                />
              </div>
              
              {/* Audio-specific metadata fields for Voice Ads */}
              {selectedCategory === "Professional Multilingual Voice Ads" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        name="language"
                        placeholder="e.g., English, 中文, العربية"
                        disabled={isUploading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select name="gender" disabled={isUploading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Neutral">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accent">Accent (Optional)</Label>
                      <Input
                        id="accent"
                        name="accent"
                        placeholder="e.g., American, British, native"
                        disabled={isUploading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ageRange">Age Range (Optional)</Label>
                      <Input
                        id="ageRange"
                        name="ageRange"
                        placeholder="e.g., adult, child, senior"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {selectedCategory === "AI Podcast Production" && (
                <>
                  <div>
                    <Label htmlFor="episodeType">Episode Type</Label>
                    <Select name="episodeType" disabled={isUploading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full Episode">Full Episode</SelectItem>
                        <SelectItem value="Short Episode">Short Episode</SelectItem>
                        <SelectItem value="Teaser">Teaser</SelectItem>
                        <SelectItem value="Bonus Content">Bonus Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tags">Category Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="e.g., technology, comedy, business"
                      disabled={isUploading}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hostName">Host Name (Optional)</Label>
                      <Input
                        id="hostName"
                        name="hostName"
                        placeholder="Host name"
                        disabled={isUploading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="guestName">Guest Name (Optional)</Label>
                      <Input
                        id="guestName"
                        name="guestName"
                        placeholder="Guest name"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </>
              )}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-500">
                    Compressing and optimizing your media...
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-purple-600 hover:bg-purple-700"
                data-testid="button-upload-submit"
              >
                {isUploading ? "Processing..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
            <DialogDescription>
              Update the title or category of this media item.
            </DialogDescription>
          </DialogHeader>
          {selectedMedia && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateMutation.mutate({
                  id: selectedMedia.id,
                  data: {
                    title: formData.get("title"),
                    category: formData.get("category"),
                  },
                });
              }}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={selectedMedia.title}
                    required
                    data-testid="input-edit-title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    name="category"
                    defaultValue={selectedMedia.category}
                    required
                  >
                    <SelectTrigger data-testid="select-edit-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="button-edit-submit"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedMedia?.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedMedia) {
                  deleteMutation.mutate(selectedMedia.id);
                }
              }}
              data-testid="button-delete-confirm"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
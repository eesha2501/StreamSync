import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Calendar, Video, Film, Edit, Trash, Play, Pause, Upload } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { InsertStream, Stream, Video as VideoType, InsertVideo } from '@shared/schema';
import Navbar from '@/components/Navbar';

// Stream form schema
const streamFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters long",
  }),
  thumbnailUrl: z.string().url({
    message: "Please enter a valid URL for the thumbnail",
  }),
  streamUrl: z.string().url({
    message: "Please enter a valid YouTube URL",
  }),
  category: z.string().min(1, {
    message: "Category is required",
  }),
  scheduledStartTime: z.string().min(1, {
    message: "Scheduled start time is required",
  }),
  isLive: z.boolean().default(false),
});

// Video form schema
const videoFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters long",
  }),
  thumbnailUrl: z.string().url({
    message: "Please enter a valid URL for the thumbnail",
  }),
  videoUrl: z.string().url({
    message: "Please enter a valid video URL",
  }),
  category: z.string().min(1, {
    message: "Category is required",
  }),
  duration: z.number().int().positive({
    message: "Duration must be a positive number",
  }),
  releaseYear: z.string().regex(/^\d{4}$/, {
    message: "Release year must be a 4-digit year",
  }),
});

type StreamFormValues = z.infer<typeof streamFormSchema>;
type VideoFormValues = z.infer<typeof videoFormSchema>;

const AdminPanel = () => {
  const { toast } = useToast();
  const [isAddStreamDialogOpen, setIsAddStreamDialogOpen] = useState(false);
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);

  // Set up queries
  const { data: streams = [], isLoading: isLoadingStreams } = useQuery<Stream[]>({
    queryKey: ['/api/streams'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/streams');
      return res.json();
    },
  });

  const { data: videos = [], isLoading: isLoadingVideos } = useQuery<VideoType[]>({
    queryKey: ['/api/videos'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/videos');
      return res.json();
    },
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users');
      return res.json();
    },
  });

  // Stream form
  const streamForm = useForm<StreamFormValues>({
    resolver: zodResolver(streamFormSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnailUrl: '',
      streamUrl: '',
      category: '',
      scheduledStartTime: new Date().toISOString().slice(0, 16),
      isLive: false,
    },
  });

  // Video form
  const videoForm = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnailUrl: '',
      videoUrl: '',
      category: '',
      duration: 0,
      releaseYear: new Date().getFullYear().toString(),
    },
  });

  // Stream mutations
  const createStreamMutation = useMutation({
    mutationFn: async (data: InsertStream) => {
      const res = await apiRequest('POST', '/api/streams', data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create stream');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Stream Created',
        description: 'The stream has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/streams'] });
      streamForm.reset();
      setIsAddStreamDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to Create Stream',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  // Video mutations
  const createVideoMutation = useMutation({
    mutationFn: async (data: InsertVideo) => {
      const res = await apiRequest('POST', '/api/videos', data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create video');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Video Created',
        description: 'The video has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      videoForm.reset();
      setIsAddVideoDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to Create Video',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  // Stream toggle live status
  const toggleStreamLiveMutation = useMutation({
    mutationFn: async ({ id, isLive }: { id: number; isLive: boolean }) => {
      const res = await apiRequest('PATCH', `/api/streams/${id}`, { isLive });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update stream');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/streams'] });
      toast({
        title: 'Stream Updated',
        description: 'The stream status has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Update Stream',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  // Delete mutations
  const deleteStreamMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/streams/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete stream');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/streams'] });
      toast({
        title: 'Stream Deleted',
        description: 'The stream has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Delete Stream',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/videos/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete video');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: 'Video Deleted',
        description: 'The video has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Delete Video',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleCreateStream = (data: StreamFormValues) => {
    createStreamMutation.mutate({
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl,
      streamUrl: data.streamUrl,
      startTime: new Date(data.scheduledStartTime), // Match schema
      isLive: data.isLive,
      viewerCount: 0,
    });
  };

  const handleCreateVideo = (data: VideoFormValues) => {
    createVideoMutation.mutate({
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl,
      videoUrl: data.videoUrl,
      category: data.category,
      duration: data.duration,
      isLive: false,
    });
  };

  const toggleStreamLive = (id: number, currentStatus: boolean) => {
    toggleStreamLiveMutation.mutate({ id, isLive: !currentStatus });
  };

  return (
    <div className="bg-[#141414] min-h-screen text-gray-200">
      <Navbar />
      
      <main className="pt-24 pb-10 container mx-auto px-4 md:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage your StreamSync content and users</p>
        </div>
        
        <Tabs defaultValue="streams" className="w-full">
          <TabsList className="bg-[#221F1F] border border-gray-700 mb-6">
            <TabsTrigger value="streams" className="data-[state=active]:bg-[#E50914] data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Streams
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-[#E50914] data-[state=active]:text-white">
              <Video className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#E50914] data-[state=active]:text-white">
              <Film className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>
          
          {/* Streams Tab */}
          <TabsContent value="streams">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Live & Upcoming Streams</h2>
              <Dialog open={isAddStreamDialogOpen} onOpenChange={setIsAddStreamDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#E50914] hover:bg-[#f40612] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stream
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#221F1F] text-white max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Create New Stream</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Set up a new live or scheduled stream with YouTube link.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...streamForm}>
                    <form onSubmit={streamForm.handleSubmit(handleCreateStream)} className="space-y-6">
                      <FormField
                        control={streamForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stream Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter stream title" 
                                className="bg-[#141414] border-gray-700" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={streamForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter stream description" 
                                className="bg-[#141414] border-gray-700 min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={streamForm.control}
                          name="thumbnailUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Thumbnail URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/thumbnail.jpg" 
                                  className="bg-[#141414] border-gray-700" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={streamForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Gaming, Music, etc." 
                                  className="bg-[#141414] border-gray-700" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={streamForm.control}
                        name="streamUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://youtube.com/watch?v=..." 
                                className="bg-[#141414] border-gray-700" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Enter the full YouTube URL of the stream
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={streamForm.control}
                        name="scheduledStartTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scheduled Start Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                className="bg-[#141414] border-gray-700" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={streamForm.control}
                        name="isLive"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-[#E50914]"
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer">Set as Live Now</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          className="bg-[#E50914] hover:bg-[#f40612] text-white"
                          disabled={createStreamMutation.isPending}
                        >
                          {createStreamMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Stream'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            {isLoadingStreams ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-[#E50914]" />
              </div>
            ) : streams.length === 0 ? (
              <Card className="bg-[#221F1F] border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-500 mb-4" />
                  <p className="text-gray-400 text-center">No streams found. Create your first stream to get started.</p>
                  <Button 
                    className="bg-[#E50914] hover:bg-[#f40612] text-white mt-4"
                    onClick={() => setIsAddStreamDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stream
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#221F1F]">
                    <TableRow className="border-gray-700 hover:bg-[#2e2b2b]">
                      <TableHead className="text-gray-300">Title</TableHead>
                      <TableHead className="text-gray-300">Category</TableHead>
                      <TableHead className="text-gray-300">Scheduled Time</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Viewers</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {streams.map((stream) => (
                      <TableRow key={stream.id} className="border-gray-700 hover:bg-[#2e2b2b]">
                        <TableCell className="font-medium text-white">{stream.title}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          {stream.startTime ? format(new Date(stream.startTime), 'MMM dd, yyyy HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${stream.isLive ? 'bg-green-500' : 'bg-gray-500'}`} />
                            <span>{stream.isLive ? 'Live' : 'Scheduled'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{stream.viewerCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-gray-300 border-gray-700 hover:bg-[#2e2b2b] hover:text-white"
                              onClick={() => toggleStreamLive(stream.id, stream.isLive || false)}
                            >
                              {stream.isLive ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-gray-300 border-gray-700 hover:bg-[#2e2b2b] hover:text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 border-gray-700 hover:bg-red-900 hover:text-white"
                              onClick={() => deleteStreamMutation.mutate(stream.id)}
                              disabled={deleteStreamMutation.isPending}
                            >
                              {deleteStreamMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Video Library</h2>
              <Dialog open={isAddVideoDialogOpen} onOpenChange={setIsAddVideoDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#E50914] hover:bg-[#f40612] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#221F1F] text-white max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Add New Video</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Add a new video to your StreamSync library.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...videoForm}>
                    <form onSubmit={videoForm.handleSubmit(handleCreateVideo)} className="space-y-6">
                      <FormField
                        control={videoForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter video title" 
                                className="bg-[#141414] border-gray-700" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={videoForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter video description" 
                                className="bg-[#141414] border-gray-700 min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={videoForm.control}
                          name="thumbnailUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Thumbnail URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/thumbnail.jpg" 
                                  className="bg-[#141414] border-gray-700" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={videoForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Movies, TV Shows, etc." 
                                  className="bg-[#141414] border-gray-700" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={videoForm.control}
                        name="videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/video.mp4" 
                                className="bg-[#141414] border-gray-700" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Enter the full URL of the video file or embed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={videoForm.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (seconds)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  className="bg-[#141414] border-gray-700" 
                                  {...field}
                                  onChange={event => field.onChange(parseInt(event.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={videoForm.control}
                          name="releaseYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Release Year</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="2023" 
                                  className="bg-[#141414] border-gray-700" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          className="bg-[#E50914] hover:bg-[#f40612] text-white"
                          disabled={createVideoMutation.isPending}
                        >
                          {createVideoMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Video
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            {isLoadingVideos ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-[#E50914]" />
              </div>
            ) : videos.length === 0 ? (
              <Card className="bg-[#221F1F] border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Video className="h-12 w-12 text-gray-500 mb-4" />
                  <p className="text-gray-400 text-center">No videos found. Add your first video to the library.</p>
                  <Button 
                    className="bg-[#E50914] hover:bg-[#f40612] text-white mt-4"
                    onClick={() => setIsAddVideoDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#221F1F]">
                    <TableRow className="border-gray-700 hover:bg-[#2e2b2b]">
                      <TableHead className="text-gray-300">Title</TableHead>
                      <TableHead className="text-gray-300">Category</TableHead>
                      <TableHead className="text-gray-300">Duration</TableHead>
                      <TableHead className="text-gray-300">Release Year</TableHead>
                      <TableHead className="text-gray-300">Views</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id} className="border-gray-700 hover:bg-[#2e2b2b]">
                        <TableCell className="font-medium text-white">{video.title}</TableCell>
                        <TableCell>{video.category}</TableCell>
                        <TableCell>
                          {video.duration ? `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, '0')}` : '-'}
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-gray-300 border-gray-700 hover:bg-[#2e2b2b] hover:text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 border-gray-700 hover:bg-red-900 hover:text-white"
                              onClick={() => deleteVideoMutation.mutate(video.id)}
                              disabled={deleteVideoMutation.isPending}
                            >
                              {deleteVideoMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">User Management</h2>
            </div>
            
            {isLoadingUsers ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-[#E50914]" />
              </div>
            ) : users.length === 0 ? (
              <Card className="bg-[#221F1F] border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-400 text-center">No users found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#221F1F]">
                    <TableRow className="border-gray-700 hover:bg-[#2e2b2b]">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Username</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-300">Joined</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-gray-700 hover:bg-[#2e2b2b]">
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium text-white">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.role === 'ADMIN' 
                              ? 'bg-red-900 text-white' 
                              : user.role === 'CHANNEL_ADMIN' 
                                ? 'bg-blue-900 text-white' 
                                : 'bg-gray-700 text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full mr-2 bg-green-500" />
                            <span>Active</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-10">
          <Card className="bg-[#221F1F] border-gray-700">
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                Key metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#141414] rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <div className="bg-[#141414] rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm">Active Streams</p>
                  <p className="text-2xl font-bold text-white">{streams.filter(s => s.isLive).length}</p>
                </div>
                <div className="bg-[#141414] rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm">Total Videos</p>
                  <p className="text-2xl font-bold text-white">{videos.length}</p>
                </div>
                <div className="bg-[#141414] rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm">Total Views</p>
                  <p className="text-2xl font-bold text-white">
                    0
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
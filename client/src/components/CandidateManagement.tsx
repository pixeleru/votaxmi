import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Candidate, type InsertCandidate, insertCandidateSchema } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, Trash, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Extend the insertCandidateSchema for the form
const candidateFormSchema = insertCandidateSchema.extend({
  grade: z.string().min(1, "Please select a grade")
});

type CandidateFormValues = z.infer<typeof candidateFormSchema>;

const CandidateManagement = () => {
  const { toast } = useToast();
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);

  // Fetch candidates
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['/api/results']
  });

  // Form handling
  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      name: "",
      grade: "",
      description: "",
      photoUrl: ""
    }
  });

  // Set form values when editing a candidate
  const resetForm = (candidate?: Candidate) => {
    form.reset({
      name: candidate?.name || "",
      grade: candidate?.grade.toString() || "",
      description: candidate?.description || "",
      photoUrl: candidate?.photoUrl || ""
    });
  };

  // Handle editing a candidate
  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    resetForm(candidate);
  };

  // Handle deleting a candidate
  const handleDeleteClick = (candidate: Candidate) => {
    setCandidateToDelete(candidate);
    setIsDeleteDialogOpen(true);
  };

  // Add candidate mutation
  const addCandidateMutation = useMutation({
    mutationFn: async (candidate: InsertCandidate) => {
      return await apiRequest("POST", "/api/admin/candidates", candidate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
      toast({
        title: "Candidate added",
        description: "The candidate has been added successfully.",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to add candidate",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Update candidate mutation
  const updateCandidateMutation = useMutation({
    mutationFn: async ({ id, candidate }: { id: number; candidate: Partial<InsertCandidate> }) => {
      return await apiRequest("PUT", `/api/admin/candidates/${id}`, candidate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
      toast({
        title: "Candidate updated",
        description: "The candidate has been updated successfully.",
      });
      setEditingCandidate(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to update candidate",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete candidate mutation
  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/candidates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
      toast({
        title: "Candidate deleted",
        description: "The candidate has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setCandidateToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete candidate",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: CandidateFormValues) => {
    // Convert grade from string to number
    const candidateData: InsertCandidate = {
      ...values,
      grade: parseInt(values.grade)
    };

    if (editingCandidate) {
      updateCandidateMutation.mutate({ id: editingCandidate.id, candidate: candidateData });
    } else {
      addCandidateMutation.mutate(candidateData);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-primary font-sans mb-4">Candidate Management</h3>
        
        {/* Add/Edit Candidate Form */}
        <div className="add-candidate-form mb-8 border-b pb-6">
          <h4 className="font-semibold text-primary mb-3">
            {editingCandidate ? "Edit Candidate" : "Add New Candidate"}
          </h4>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter candidate name"
                        className="border rounded-lg p-2 w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Grade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border rounded-lg p-2 w-full">
                          <SelectValue placeholder="Select a grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-sm font-medium text-gray-700">Bio/Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter candidate description"
                        className="border rounded-lg p-2 w-full"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Photo URL</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          {...field}
                          placeholder="Enter photo URL"
                          className="border rounded-lg p-2 w-full"
                        />
                        <Button type="button" variant="outline" size="icon" className="shrink-0">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-end gap-2 mt-4">
                <Button 
                  type="submit"
                  className="bg-primary text-white py-2 px-4 rounded hover:bg-[#3a0066] transition-all"
                  disabled={addCandidateMutation.isPending || updateCandidateMutation.isPending}
                >
                  {editingCandidate 
                    ? (updateCandidateMutation.isPending ? "Updating..." : "Update Candidate") 
                    : (addCandidateMutation.isPending ? "Adding..." : "Add Candidate")}
                </Button>
                
                {editingCandidate && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setEditingCandidate(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
        
        {/* Candidate List */}
        <div className="candidate-management">
          <h4 className="font-semibold text-primary mb-3">Manage Existing Candidates</h4>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded-full mr-3" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="flex space-x-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Candidate</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates?.map((candidate: any) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <img 
                            src={candidate.photoUrl} 
                            className="w-8 h-8 rounded-full object-cover mr-3" 
                            alt={candidate.name} 
                          />
                          <span className="font-medium">{candidate.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>Grade {candidate.grade}</TableCell>
                      <TableCell>{candidate.votes}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleEditCandidate(candidate)}
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteClick(candidate)}
                          >
                            <Trash className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {candidateToDelete?.name}'s candidate profile and all associated votes.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  if (candidateToDelete) {
                    deleteCandidateMutation.mutate(candidateToDelete.id);
                  }
                }}
                disabled={deleteCandidateMutation.isPending}
              >
                {deleteCandidateMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default CandidateManagement;

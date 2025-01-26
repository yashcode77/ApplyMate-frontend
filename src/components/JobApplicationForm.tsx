import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JobApplication, ApplicationStatus } from '@/types/index';
import { toast } from 'react-toastify';
import axios from 'axios';

interface JobApplicationFormProps {
  onSubmit: (application: JobApplication) => void;
  initialData?: JobApplication;
}

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState<JobApplication>({
    companyName: initialData?.companyName || '',
    jobTitle: initialData?.jobTitle || '',
    jobDescription: initialData?.jobDescription || '',
    jobUrl: initialData?.jobUrl || '',
    status: initialData?.status || ApplicationStatus.APPLIED,
    resumeUrl: initialData?.resumeUrl || ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleResumeUpload = async () => {
    if (!resumeFile) return null;

    const formData = new FormData();
    formData.append('file', resumeFile);

    try {
      const response = await axios.post('/files/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data; 
    } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Resume upload failed",
    //     variant: "destructive"
    //   });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uploadedResumeUrl = resumeFile ? await handleResumeUpload() : formData.resumeUrl;

      const submissionData = {
        ...formData,
        resumeUrl: uploadedResumeUrl,
        createdAt: initialData?.applicationDate || new Date()
      };

      const response = initialData?.id
        ? await axios.put(`/applications/${initialData.id}`, submissionData)
        : await axios.post('/applications', submissionData);

      onSubmit(response.data);
      setIsDialogOpen(false);
    } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to save application",
    //     variant: "destructive"
    //   });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className='h-9'>
          {initialData ? 'Edit Applicaion' : 'Add New Application'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Job Application' : 'Add New Job Application'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Company Name"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
          <Input
            placeholder="Job Title"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            required
          />
          <Textarea
            placeholder="Job Description"
            value={formData.jobDescription}
            onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
          />
          <Input
            placeholder="Job URL"
            value={formData.jobUrl}
            onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
          />
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setResumeFile(file);
            }}
          />
          {formData.resumeUrl && (
            <a
              href={`https://applymate.s3.ap-south-1.amazonaws.com/${formData.resumeUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              View Current Resume
            </a>
          )}
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as ApplicationStatus })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ApplicationStatus).map(status => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Save Application</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
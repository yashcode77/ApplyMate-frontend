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
    status: initialData?.status || ApplicationStatus.APPLIED
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = initialData?.id 
        ? await axios.put(`applications/${initialData.id}`, formData)
        : await axios.post('applications', formData);
      
      onSubmit(response.data);
    } catch (error) {
      console.error('Error saving application', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {initialData ? 'Edit Application' : 'Add New Application'}
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
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            required 
          />
          <Input 
            placeholder="Job Title" 
            value={formData.jobTitle}
            onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
            required 
          />
          <Textarea 
            placeholder="Job Description" 
            value={formData.jobDescription}
            onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
          />
          <Input 
            placeholder="Job URL" 
            value={formData.jobUrl}
            onChange={(e) => setFormData({...formData, jobUrl: e.target.value})}
          />
          <Select 
            value={formData.status}
            onValueChange={(value) => setFormData({...formData, status: value as ApplicationStatus})}
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

export const JobApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`applications/${id}`);
      setApplications(applications.filter(app => app.id !== id));
    } catch (error) {
      console.error('Error deleting application', error);
    }
  };

  React.useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="space-y-4">
      <JobApplicationForm 
        onSubmit={(newApp) => {
          const updatedApps = newApp.id 
            ? applications.map(app => app.id === newApp.id ? newApp : app)
            : [...applications, newApp];
          setApplications(updatedApps);
        }} 
      />
      {applications.map(app => (
        <div key={app.id} className="border p-4 flex justify-between items-center">
          <div>
            <h3 className="font-bold">{app.companyName} - {app.jobTitle}</h3>
            <p>{app.status}</p>
          </div>
          <div className="space-x-2">
            <JobApplicationForm 
              initialData={app}
              onSubmit={(updatedApp) => {
                setApplications(applications.map(a => 
                  a.id === updatedApp.id ? updatedApp : a
                ));
              }}
            />
            <Button 
              variant="destructive" 
              onClick={() => app.id && handleDelete(app.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
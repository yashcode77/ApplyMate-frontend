import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { JobApplicationForm } from './JobApplicationForm';
import { JobApplication, ApplicationStatus } from '@/types/index';

export const JobApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/applications');
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/applications/${id}`);
      setApplications(applications.filter(app => app.id !== id));
      toast.success('Application deleted successfully');
    } catch (error) {
      toast.error('Failed to delete application');
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => 
      (statusFilter === 'ALL' || app.status === statusFilter) &&
      (searchTerm === '' || 
        app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [applications, searchTerm, statusFilter]);

  React.useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input 
          placeholder="Search applications..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select 
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as ApplicationStatus | 'ALL')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.values(ApplicationStatus).map(status => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <JobApplicationForm
          onSubmit={(newApp) => {
            const updatedApps = newApp.id
              ? applications.map(app => app.id === newApp.id ? newApp : app)
              : [...applications, newApp];
            setApplications(updatedApps);
            toast.success(newApp.id ? 'Application updated' : 'Application added');
          }}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredApplications.map(app => (
            <TableRow key={app.id}>
              <TableCell>{app.companyName}</TableCell>
              <TableCell>{app.jobTitle}</TableCell>
              <TableCell>{app.status.replace('_', ' ')}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <JobApplicationForm
                    initialData={app}
                    onSubmit={(updatedApp) => {
                      setApplications(applications.map(a =>
                        a.id === updatedApp.id ? updatedApp : a
                      ));
                      toast.success('Application updated');
                    }}
                  />
                  <Button 
                    variant="destructive" 
                    onClick={() => app.id && handleDelete(app.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { JobApplicationList } from '../components/JobApplications';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ApplicationStatus, JobApplication } from '@/types/index';

const Dashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [statusStats, setStatusStats] = useState<{status: string, count: number}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicationsResponse, statsResponse] = await Promise.all([
          axios.get('applications'),
          axios.get('job-search/stats')
        ]);
        setApplications(applicationsResponse.data);
        console.log(applicationsResponse)
        
        // Process status statistics
        const statusCounts = Object.values(ApplicationStatus).map(status => ({
          status: status.replace('_', ' '),
          count: applicationsResponse.data.filter(
            (app: JobApplication) => app.status === status
          ).length
        }));
        setStatusStats(statusCounts);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.username || 'User'}
        </h1>
        <Button onClick={logout} variant="destructive">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusStats}>
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Applications</p>
                <p className="text-2xl font-bold">
                  {applications.filter(
                    app => 
                      app.status !== ApplicationStatus.REJECTED && 
                      app.status !== ApplicationStatus.WITHDRAWN
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Job Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <JobApplicationList />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
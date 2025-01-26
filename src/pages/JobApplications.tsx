import React from 'react';
// import { JobApplicationList } from '@/components/JobApplicationList';
import { Layout } from '@/components/Layouts';

export const JobApplications: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Job Applications</h1>
        {/* <JobApplicationList /> */}
      </div>
    </Layout>
  );
};
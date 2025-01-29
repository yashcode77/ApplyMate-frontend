import type React from "react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronUp, ChevronDown, EyeIcon, SearchIcon } from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { type JobApplication, ApplicationStatus } from "@/types/index"
import axios from "axios"
import { JobApplicationForm } from "./JobApplicationForm"

export const JobApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof JobApplication
    direction: "ascending" | "descending"
  }>({ key: "companyName", direction: "ascending" })
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL")
  const [viewDetailsApp, setViewDetailsApp] = useState<JobApplication | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchApplications = useCallback(async () => {
    try {
      const response = await axios.get("applications")
      setApplications(response.data)
    } catch (error) {
      toast.error("Failed to fetch applications")
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])


  const handleDelete = useCallback(async (id: number) => {
    try {
      await axios.delete(`applications/${id}`)
      setApplications((prevApps) => prevApps.filter((app) => app.id !== id))
      toast.success("Application deleted successfully")
    } catch (error) {
      toast.error("Failed to delete application")
    }
  }, [])

  const handleSubmit = useCallback(async (newApp: JobApplication) => {
    try {
      if (newApp.id) {
        await axios.put(`applications/${newApp.id}`, newApp)
      } else {
        await axios.post("applications", newApp)
      }

      // Fetch updated applications list
      await fetchApplications()

      toast.success(newApp.id ? "Application updated successfully" : "Application added successfully")
    } catch (error) {
      toast.error("Failed to save application")
    }
  }, [fetchApplications])

  const handleSort = useCallback((key: keyof JobApplication) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }))
  }, [])

  const filteredAndSortedApplications = useMemo(() => {
    let result = [...applications]

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase()
      result = result.filter(
        (app) =>
          app.companyName.toLowerCase().includes(searchTermLower) ||
          app.jobTitle.toLowerCase().includes(searchTermLower),
      )
    }

    if (statusFilter !== "ALL") {
      result = result.filter((app) => app.status === statusFilter)
    }

    result.sort((a, b) => {
      const valueA = a[sortConfig.key]
      const valueB = b[sortConfig.key]

      if (valueA === undefined || valueB === undefined) return 0

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortConfig.direction === "ascending" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      }

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortConfig.direction === "ascending" ? valueA - valueB : valueB - valueA
      }

      return 0
    })

    return result
  }, [applications, searchTerm, sortConfig, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 mb-4">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "ALL")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.values(ApplicationStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <JobApplicationForm onSubmit={handleSubmit} />

      <Table>
        <TableHeader>
          <TableRow>
            {(["companyName", "jobTitle", "status", "applicationDate"] as (keyof JobApplication)[]).map((key) => (
              <TableHead key={key} onClick={() => handleSort(key)} className="cursor-pointer">
                <div className="flex items-center">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  {sortConfig.key === key &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="ml-2 w-4 h-4" />
                    ) : (
                      <ChevronDown className="ml-2 w-4 h-4" />
                    ))}
                </div>
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedApplications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.companyName}</TableCell>
              <TableCell>{app.jobTitle}</TableCell>
              <TableCell>{app.status.replace("_", " ")}</TableCell>
              <TableCell>
                {typeof app.applicationDate === "string"
                  ? new Date(app.applicationDate).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setViewDetailsApp(app)}>
                    <EyeIcon className="w-4 h-4 mr-2" /> View
                  </Button>
                  <JobApplicationForm initialData={app} onSubmit={handleSubmit} />
                  <Button className='h-9' variant="destructive" size="sm" onClick={() => app.id && handleDelete(app.id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!viewDetailsApp}
        onOpenChange={(open) => {
          if (!open) setViewDetailsApp(null)
          setIsModalOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Detailed information about the job application</DialogDescription>
          </DialogHeader>
          {viewDetailsApp && (
            <div className="space-y-4">
              <div>
                <strong>Company:</strong> {viewDetailsApp.companyName}
              </div>
              <div>
                <strong>Job Title:</strong> {viewDetailsApp.jobTitle}
              </div>
              <div>
                <strong>Status:</strong> {viewDetailsApp.status.replace("_", " ")}
              </div>
              <div>
                <strong>Job Description:</strong> {viewDetailsApp.jobDescription}
              </div>
              {viewDetailsApp.jobUrl && (
                <div>
                  <strong>Job URL:</strong>{" "}
                  <a href={viewDetailsApp.jobUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    View Job Posting
                  </a>
                </div>
              )}
              {viewDetailsApp.resumeUrl && (
                <div>
                  <strong>Resume:</strong>{" "}
                  <a
                    href={`https://applymate.s3.ap-south-1.amazonaws.com/${viewDetailsApp.resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    View Resume
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ToastContainer position="bottom-right" />
    </div>
  )
}


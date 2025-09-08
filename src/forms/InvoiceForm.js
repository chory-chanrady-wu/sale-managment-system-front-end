import React, { useState, useEffect } from "react";
import FormContainer from "../components/FormContainer";
import { fetchJobs, saveJob } from "../api";

export default function JobsForm() {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({ Job_Title: "", Min_Salary: "", Max_Salary: "" });

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => setJobs((await fetchJobs()).data);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => { e.preventDefault(); await saveJob(formData); setFormData({ Job_Title: "", Min_Salary: "", Max_Salary: "" }); loadJobs(); };

  return (
    <FormContainer title="Jobs Form">
      <form onSubmit={handleSubmit} className="mb-4">
        <table className="min-w-full border border-gray-300">
          <tbody>
            <tr className="border-b"><td className="p-2">Job Title</td><td><input name="Job_Title" value={formData.Job_Title} onChange={handleChange} className="w-full border p-1 rounded" /></td></tr>
            <tr className="border-b"><td>Min Salary</td><td><input type="number" name="Min_Salary" value={formData.Min_Salary} onChange={handleChange} className="w-full border p-1 rounded" /></td></tr>
            <tr><td>Max Salary</td><td><input type="number" name="Max_Salary" value={formData.Max_Salary} onChange={handleChange} className="w-full border p-1 rounded" /></td></tr>
          </tbody>
        </table>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
      </form>

      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100"><tr><th className="p-2 border">Job ID</th><th className="p-2 border">Job Title</th><th className="p-2 border">Min Salary</th><th className="p-2 border">Max Salary</th></tr></thead>
        <tbody>{jobs.map(j => <tr key={j.JOB_ID} className="border-b"><td className="p-2 border">{j.JOB_ID}</td><td className="p-2 border">{j.Job_Title}</td><td className="p-2 border">{j.Min_Salary}</td><td className="p-2 border">{j.Max_Salary}</td></tr>)}</tbody>
      </table>
    </FormContainer>
  );
}

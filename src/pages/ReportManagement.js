import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReportManagement() {
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ TemplateName: '', SqlQuery: '' });
  const [previewData, setPreviewData] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const API_URL = 'http://localhost:4000/api/reports';

  // Fetch all templates
  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${API_URL}/templates`);
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      alert('Failed to fetch templates. Check backend logs.');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Save new template
  const handleSaveTemplate = async () => {
        if (!newTemplate.TemplateName || !newTemplate.SqlQuery) {
            return alert('Please fill template name and SQL query.');
        }
        try {
            await axios.post(`${API_URL}/templates`, newTemplate);
            setNewTemplate({ TemplateName: '', SqlQuery: '' });
            setPreviewData([]);        // <-- Clear preview
            setPreviewColumns([]);     // <-- Clear preview columns
            setSelectedTemplateId(null);
            fetchTemplates();
        } catch (err) {
            console.error('Failed to save template:', err);
            alert('Failed to save template. Check backend logs.');
        }
    };

      // Preview template data with bind prompts
    const handlePreview = async (template) => {
      try {
        const sql = template.SQLQUERY;

        // 1. Extract bind variables from SQL (like :id, :startDate)
        const bindMatches = [...sql.matchAll(/:\w+/g)];
        const bindKeys = [...new Set(bindMatches.map(m => m[0].substring(1)))];

        let binds = {};
        if (bindKeys.length > 0) {
          // 2. Prompt user for each bind variable
          for (const key of bindKeys) {
            const value = prompt(`Enter value for ${key}:`);
            if (value === null) {
              // User cancelled
              return;
            }
            binds[key] = value;
          }
        }

        // 3. Call backend with template ID and binds
        const res = await axios.post(`${API_URL}/generate/${template.TEMPLATEID}`, {
          format: 'json',
          binds
        });

        if (Array.isArray(res.data)) {
          setPreviewData(res.data);
          setPreviewColumns(res.data.length > 0 ? Object.keys(res.data[0]) : []);
          setSelectedTemplateId(template.TEMPLATEID);
        }
      } catch (err) {
        console.error('Failed to fetch preview:', err);
        const msg = err.response?.data?.error || 'Failed to fetch preview. Check backend logs.';
        alert(msg);

        // Clear preview if error
        setPreviewData([]);
        setPreviewColumns([]);
        setSelectedTemplateId(null);
      }
    };

    // Preview new template before saving
    const handlePreviewNew = async () => {
    if (!newTemplate.SqlQuery) return alert('Enter SQL query to preview.');
    try {
        const res = await axios.post(`${API_URL}/preview`, { SqlQuery: newTemplate.SqlQuery });
        if (Array.isArray(res.data)) {
        setPreviewData(res.data);
        setPreviewColumns(res.data.length > 0 ? Object.keys(res.data[0]) : []);
        setSelectedTemplateId(null); // Not saved yet
        }
    } catch (err) {
        console.error('Failed to preview new template:', err);
        alert('Failed to preview SQL. Check backend logs.');
    }
    };
    // Delete a saved template
    const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
        await axios.delete(`${API_URL}/templates/${id}`);
        fetchTemplates(); // refresh template list
        if (selectedTemplateId === id) {
        setPreviewData([]);
        setPreviewColumns([]);
        setSelectedTemplateId(null);
        }
    } catch (err) {
        console.error('Failed to delete template:', err);
        alert('Failed to delete template. Check backend logs.');
    }
    };

  // Generate Excel or PDF
  const handleGenerate = async (id, format) => {
    try {
      const res = await axios.post(
        `${API_URL}/generate/${id}`,
        { format },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Failed to generate ${format}:`, err);
      alert(`Failed to generate ${format}. Check backend logs.`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Report Management</h2>

      {/* Add new template */}
      <div className="mb-4 border p-4 rounded shadow">
        <h3 className="font-bold mb-2">Add New Report Template</h3>
        <input
          type="text"
          placeholder="Template Name"
          className="border p-2 w-full mb-2 rounded"
          value={newTemplate.TemplateName}
          onChange={e => setNewTemplate({ ...newTemplate, TemplateName: e.target.value })}
        />
        <textarea
            placeholder="SQL Query"
            className="border p-2 w-full mb-2 rounded"
            rows={4}
            value={newTemplate.SqlQuery}
            onChange={e => {
                setNewTemplate({ ...newTemplate, SqlQuery: e.target.value });
                if (!e.target.value) {      // <-- if box is cleared
                setPreviewData([]);
                setPreviewColumns([]);
                setSelectedTemplateId(null);
                }
            }}
        />
        <button
          onClick={handleSaveTemplate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Template
        </button>
        <button
            onClick={handlePreviewNew}
            className="bg-purple-500 text-white px-4 py-2 rounded ml-2"
            >
            Preview
        </button>
      </div>

      {/* List templates */}
      {templates.map(t => (
        <div key={t.TEMPLATEID} className="border p-2 mb-2 rounded flex justify-between items-center">
            <div>{t.TEMPLATENAME}</div>
            <div>
            <button
                onClick={() => handlePreview(t)}
                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
            >
                Preview
            </button>
            <button
                onClick={() => handleGenerate(t.TEMPLATEID, 'excel')}
                className="bg-green-500 text-white px-2 py-1 rounded mr-2"
            >
                Excel
            </button>
            <button
                onClick={() => handleGenerate(t.TEMPLATEID, 'pdf')}
                className="bg-red-500 text-white px-2 py-1 rounded mr-2"
            >
                PDF
            </button>
            {/* Delete Button */}
            <button
                onClick={() => handleDeleteTemplate(t.TEMPLATEID)}
                className="bg-gray-700 text-white px-2 py-1 rounded"
            >
                Delete
            </button>
            </div>
        </div>
        ))}


      {/* Preview table */}
      {previewData.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Report Preview</h3>
          <div className="overflow-auto border rounded">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  {previewColumns.map(col => (
                    <th key={col} className="border px-2 py-1 text-left">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {previewColumns.map(col => (
                      <td key={col} className="border px-2 py-1">{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

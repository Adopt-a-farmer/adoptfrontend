import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const reportService = {
  // Generate farmer report
  generateFarmerReport: async (period: string = 'month', format: string = 'json') => {
    const response = await axios.get(
      `${API_URL}/reports/farmer?period=${period}&format=${format}`,
      getAuthHeader()
    );
    return response.data;
  },

  // Generate adopter report
  generateAdopterReport: async (period: string = 'month', format: string = 'json') => {
    const response = await axios.get(
      `${API_URL}/reports/adopter?period=${period}&format=${format}`,
      getAuthHeader()
    );
    return response.data;
  },

  // Generate expert report
  generateExpertReport: async (period: string = 'month', format: string = 'json') => {
    const response = await axios.get(
      `${API_URL}/reports/expert?period=${period}&format=${format}`,
      getAuthHeader()
    );
    return response.data;
  },

  // Generate admin report
  generateAdminReport: async (
    period: string = 'month',
    reportType: string = 'overview',
    format: string = 'json'
  ) => {
    const response = await axios.get(
      `${API_URL}/reports/admin?period=${period}&reportType=${reportType}&format=${format}`,
      getAuthHeader()
    );
    return response.data;
  },

  // Download farmer report as CSV
  downloadFarmerReportCSV: async (period: string = 'month') => {
    const response = await axios.get(
      `${API_URL}/reports/farmer?period=${period}&format=csv`,
      {
        ...getAuthHeader(),
        responseType: 'blob',
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `farmer-report-${period}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Download adopter report as CSV
  downloadAdopterReportCSV: async (period: string = 'month') => {
    const response = await axios.get(
      `${API_URL}/reports/adopter?period=${period}&format=csv`,
      {
        ...getAuthHeader(),
        responseType: 'blob',
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `adopter-report-${period}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Download expert report as CSV
  downloadExpertReportCSV: async (period: string = 'month') => {
    const response = await axios.get(
      `${API_URL}/reports/expert?period=${period}&format=csv`,
      {
        ...getAuthHeader(),
        responseType: 'blob',
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expert-report-${period}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Download admin report as CSV
  downloadAdminReportCSV: async (period: string = 'month', reportType: string = 'overview') => {
    const response = await axios.get(
      `${API_URL}/reports/admin?period=${period}&reportType=${reportType}&format=csv`,
      {
        ...getAuthHeader(),
        responseType: 'blob',
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `admin-${reportType}-report-${period}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

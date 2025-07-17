// App.jsx (Your file should look like this after replacing its content)
import { useState, useEffect } from 'react';
import { supabase } from './main.jsx'; // This imports the supabase client we set up

function App() {
  const [interviews, setInterviews] = useState([]); // State to store our data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to store any errors

  useEffect(() => {
    async function getInterviews() {
      const { data, error } = await supabase
        .from('Feedback_Entries') // *** Adjusted to your table name: 'Feedback_Entries' ***
        .select('*'); // Select all columns

      if (error) {
        console.error('Error fetching data:', error);
        setError(error);
      } else {
        setInterviews(data);
        console.log('Fetched data:', data); // Log data to console for debugging
      }
      setLoading(false);
    }

    getInterviews();
  }, []); // The empty array [] means this effect runs once when the component mounts

  if (loading) return <div>Loading interviews...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
  <div>
      <h1>Candidate Interview Dashboard</h1>
      <h2>Feedback Entries:</h2>
      {interviews.length === 0 ? (
        <p>No feedback entries found.</p>
      ) : (
        // Start of the list to display data
        <ul>
          {interviews.map((entry) => (
            <li key={entry.id}> {/* Using 'id' as the primary key as per your schema */}
              <h3>Entry ID: {entry.id}</h3>
              <p><strong>Created At:</strong> {new Date(entry.created_at).toLocaleString() || 'N/A'}</p>
              <p><strong>Company Name:</strong> {entry.company_name || 'N/A'}</p>
              <p><strong>Years Experience:</strong> {entry.years_experience || 'N/A'}</p>
              <p><strong>Interview Duration:</strong> {entry.interview_duration || 'N/A'}</p>
              <p><strong>Interview Stage:</strong> {entry.interview_stage || 'N/A'}</p>
              <p><strong>Communication Rating:</strong> {entry.communication_rating || 'N/A'}</p>
              <p><strong>Communication Reason:</strong> {entry.communication_reason || 'N/A'}</p>
              <p><strong>Interviewer Experience:</strong> {entry.interviewer_experience || 'N/A'}</p>
              <p><strong>Clarity on Role:</strong> {entry.clarity_on_role || 'N/A'}</p>
              <p><strong>Frustration Point:</strong> {entry.frustration_point || 'N/A'}</p>
              <p><strong>Positive Aspect:</strong> {entry.positive_aspect || 'N/A'}</p>
              <p><strong>Overall Rating:</strong> {entry.overall_rating || 'N/A'}</p>
              <p><strong>One-line Summary:</strong> {entry.one_line_sumr || 'N/A'}</p>
              <p><strong>Opt-in to be Contacted:</strong> {entry.opt_in_to_be_ === true ? 'Yes' : 'No'}</p>
              <p><strong>Email:</strong> {entry.email || 'N/A'}</p>
              <p><strong>Clarity Explanation:</strong> {entry.clarity_explain || 'N/A'}</p>
              <hr /> {/* Separator for each entry */}
            </li>
          ))}
        </ul>
        // End of the list display
      )}
    </div>
  );
}

export default App;

// App.jsx (FINAL AND CORRECTED return statement with className attributes)
import { useState, useEffect } from 'react';
import { supabase } from './main.jsx';
import './App.css';

function App() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FIRST useEffect: Fetches initial data when component mounts
  useEffect(() => {
    async function getInterviews() {
      const { data, error } = await supabase
        .from('Feedback_Entries') // Your table name
        .select('*'); // Select all columns

      if (error) {
        console.error('Error fetching data:', error);
        setError(error);
      } else {
        setInterviews(data);
        console.log('Fetched data:', data);
      }
      setLoading(false);
    }

    getInterviews();
  }, []); // Empty dependency array means this runs once on mount

  // SECOND useEffect: Sets up Realtime subscription for live updates
  useEffect(() => {
    // Set up Realtime subscription
    const subscription = supabase
      .channel('schema-db-changes') // You can name the channel anything unique
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Feedback_Entries' }, // Listen for all events on your table
        (payload) => {
          console.log('Change received!', payload); // Log the change for debugging

          // Handle different types of events
          if (payload.eventType === 'INSERT') {
            setInterviews((prevInterviews) => [...prevInterviews, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setInterviews((prevInterviews) =>
              prevInterviews.filter((entry) => entry.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            setInterviews((prevInterviews) =>
              prevInterviews.map((entry) =>
                entry.id === payload.new.id ? payload.new : entry
              )
            );
          }
        }
      )
      .subscribe(); // Don't forget to subscribe!

    // Cleanup function: unsubscribe when the component unmounts
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  if (loading) return <div>Loading feedback entries...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Candidate Interview Dashboard</h1>
      <h2>Feedback Entries:</h2>
      {interviews.length === 0 ? (
        <p className="no-entries-message">No feedback entries found.</p>
      ) : (
        // *********************************************************
        // Add className="feedback-entries-container" here for the grid layout
        // *********************************************************
        <ul className="feedback-entries-container">
          {interviews.map((entry) => (
            <li key={entry.id} className="feedback-entry-card">
              <h3>Entry ID: <span className="value-id">{entry.id ? entry.id.substring(0, 5) + '...' : 'N/A'}</span></h3>
              <p><strong>Created At:</strong> <span className="value">{new Date(entry.created_at).toLocaleString() || 'N/A'}</span></p>
              <p><strong>Company Name:</strong> <span className="value">{entry.company_name || 'N/A'}</span></p>
              <p><strong>Years Experience:</strong> <span className="value">{entry.years_experience || 'N/A'}</span></p>
              <p><strong>Interview Duration:</strong> <span className="value">{entry.interview_duration || 'N/A'}</span></p>
              <p><strong>Interview Stage:</strong> <span className="value">{entry.interview_stage || 'N/A'}</span></p>
              <p><strong>Communication Rating:</strong> <span className="value">{entry.communication_rating || 'N/A'}</span></p>
              <p><strong>Communication Reason:</strong> <span className="value">{entry.communication_reason || 'N/A'}</span></p>
              <p><strong>Interviewer Experience:</strong> <span className="value">{entry.interviewer_experience || 'N/A'}</span></p>
              <p><strong>Clarity on Role:</strong> <span className="value">{entry.clarity_on_role || 'N/A'}</span></p>
              <p><strong>Frustration Point:</strong> <span className="value">{entry.frustration_point || 'N/A'}</span></p>
              <p><strong>Positive Aspect:</strong> <span className="value">{entry.positive_aspect || 'N/A'}</span></p>
              <p><strong>Overall Rating:</strong> <span className="value">{entry.overall_rating || 'N/A'}</span></p>
              <p><strong>One-line Summary:</strong> <span className="value">{entry.one_line_sumr || 'N/A'}</span></p>
              <p><strong>Opt-in to be Contacted:</strong> <span className="value">{entry.opt_in_to_be_ === true ? 'Yes' : 'No'}</span></p>
              <p><strong>Email:</strong> <span className="value">{entry.email || 'N/A'}</span></p>
              <p><strong>Clarity Explanation:</strong> <span className="value">{entry.clarity_explain || 'N/A'}</span></p>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
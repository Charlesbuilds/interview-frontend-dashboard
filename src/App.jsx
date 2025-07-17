// src/App.jsx (UPDATED for Continuous Scroll)

import { useState, useEffect } from 'react';
import { supabase } from './main.jsx';
import './App.css'; // Make sure this import is here!

function App() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Existing useEffect for initial data fetch
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
  }, []);

  // Existing useEffect for Realtime subscription
  useEffect(() => {
    const subscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Feedback_Entries' },
        (payload) => {
          console.log('Change received!', payload);

          if (payload.eventType === 'INSERT') {
            // Add new item to the TOP of the list for waterfall effect
            setInterviews((prevInterviews) => [payload.new, ...prevInterviews]);
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
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) return <div>Loading feedback entries...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Candidate Interview Dashboard</h1>
      <h2>Feedback Entries:</h2>
      {interviews.length === 0 ? (
        <p className="no-entries-message">No feedback entries found.</p>
      ) : (
        // *** IMPORTANT CHANGE STARTS HERE ***
        <div className="scroll-container"> {/* New wrapper div */}
          <ul className="feedback-entries-container">
            {/* First set of reviews */}
            {interviews.map((entry) => (
              <li key={entry.id + "_set1"} className="feedback-entry-card"> {/* Unique key suffix */}
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
            {/* Second identical set of reviews for seamless looping */}
            {interviews.map((entry) => (
              <li key={entry.id + "_set2"} className="feedback-entry-card"> {/* Unique key suffix */}
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
        </div>
        // *** IMPORTANT CHANGE ENDS HERE ***
      )}
    </div>
  );
}

export default App;
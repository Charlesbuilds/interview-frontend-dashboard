import { useState, useEffect, useRef } from 'react';
import { supabase } from './main.jsx';
import './App.css'; // Ensure this is correctly linked

function App() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scrollContainerRef = useRef(null);
  const feedbackListRef = useRef(null);
  const [clickedCardUniqueId, setClickedCardUniqueId] = useState(null);
  const [activeCardData, setActiveCardData] = useState(null);

  useEffect(() => {
    async function getInterviews() {
      const { data, error } = await supabase
        .from('Feedback_Entries')
        .select('*');

      if (error) {
        console.error('Error fetching data:', error);
        setError(error);
      } else {
        setInterviews(data);
      }
      setLoading(false);
    }
    getInterviews();
  }, []);

  useEffect(() => {
    const subscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Feedback_Entries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
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

  const handleClickCard = (e, entryData, uniqueId) => {
    if (clickedCardUniqueId === uniqueId) {
      // If the same card is clicked again, close the modal
      setClickedCardUniqueId(null);
      setActiveCardData(null);
      // When modal closes, resume waterfall animation if not already paused by hover
      if (feedbackListRef.current) {
         feedbackListRef.current.style.animationPlayState = 'running'; // Resume animation
      }
      // Hide scrollbar on scrollContainerRef if modal is closing and not hovered
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.overflowY = 'hidden';
      }
    } else {
      // A new card is clicked (or first click), open modal
      setClickedCardUniqueId(uniqueId);
      setActiveCardData(entryData);
      // Pause waterfall effect and add muted class via JS for modal
      if (feedbackListRef.current) {
        feedbackListRef.current.style.animationPlayState = 'paused'; // Pause animation via JS
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.classList.add('cards-muted'); // Add muted class
        scrollContainerRef.current.style.overflowY = 'auto'; // Show scrollbar for modal background
      }
    }
  };

  // Removed handleCardMouseEnter and handleCardMouseLeave functions
  // Waterfall pause/scroll is now handled by CSS :hover on .scroll-container

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && activeCardData) {
        handleClickCard(null, null, clickedCardUniqueId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCardData, clickedCardUniqueId]);


  if (loading) return <div>Loading feedback entries...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const allReviews = [
    ...interviews.map(entry => ({...entry, uniqueId: entry.id + "_set1"})),
    ...interviews.map(entry => ({...entry, uniqueId: entry.id + "_set2"}))
  ];

  // Helper function to render data or 'N/A'
  const renderData = (data) => {
    const stringData = String(data); // Always convert to string first
    if (stringData === 'null' || stringData === 'undefined' || stringData.trim() === '') {
      return 'N/A';
    }
    if (data instanceof Date) {
        return data.toLocaleString();
    }
    return stringData;
  };

  // Helper function to truncate text for teaser cards
  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div className={`app-container ${activeCardData ? 'modal-open' : ''}`}>
      <h1>Candidate Interview Dashboard</h1>
      <h2>Feedback Entries:</h2>

      {interviews.length === 0 ? (
        <p className="no-entries-message">No feedback entries found.</p>
      ) : (
        // scroll-container handles overflow and animation pause via CSS :hover
        <div className="scroll-container" ref={scrollContainerRef}>
          <ul className="feedback-entries-container" ref={feedbackListRef}>
            {allReviews.map((entry) => (
              <li
                key={entry.uniqueId}
                className="feedback-entry-card"
                onClick={(e) => handleClickCard(e, entry, entry.uniqueId)}
                // Removed onMouseEnter and onMouseLeave from individual cards
                // These are now handled by CSS :hover on the parent .scroll-container
              >
                {/* All fields are rendered in order for teaser and full view */}
                <p><strong>Created At:</strong> <span className="value">{renderData(new Date(entry.created_at))}</span></p>
                <p><strong>Company Name:</strong> <span className="value">{renderData(entry.company_name)}</span></p>
                <p><strong>Years Experience:</strong> <span className="value">{renderData(entry.years_experience)}</span></p>
                <p><strong>Interview Duration:</strong> <span className="value">{renderData(entry.interview_duration)}</span></p>
                <p><strong>Interview Stage:</strong> <span className="value">{renderData(entry.interview_stage)}</span></p>
                <p><strong>Communication Rating:</strong> <span className="value">{renderData(entry.communication_rating)}</span></p>
                <p><strong>Communication Reason:</strong> <span className="value">{renderData(entry.communication_reason)}</span></p>
                {/* Teaser points: Apply renderData FIRST, then truncateText to the result */}
                <p data-teaser-point="true"><strong>Interviewer Experience:</strong> <span className="value">{truncateText(renderData(entry.interviewer_experience), 30)}</span></p>
                <p><strong>Clarity on Role:</strong> <span className="value">{renderData(entry.clarity_on_role)}</span></p>
                <p><strong>Clarity Explanation:</strong> <span className="value">{renderData(entry.clarity_explain)}</span></p>
                <p data-teaser-point="true"><strong>Frustration Point:</strong> <span className="value">{truncateText(renderData(entry.frustration_point), 30)}</span></p>
                <p><strong>Positive Aspect:</strong> <span className="value">{renderData(entry.positive_aspect)}</span></p>
                <p data-teaser-point="true"><strong>Overall Rating:</strong> <span className="value">{truncateText(renderData(entry.overall_rating), 30)}</span></p>
                <p data-teaser-point="true"><strong>One-line Summary:</strong> <span className="value">{truncateText(renderData(entry.one_line_summary), 30)}</span></p>
                <p><strong>Opt-in to be Contacted:</strong> <span className="value">{renderData(entry.opt_in_to_be_ === true ? 'Yes' : 'No')}</span></p>
                <p><strong>Email:</strong> <span className="value">{renderData(entry.email)}</span></p>
                <hr />
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeCardData && (
        <div className="active-card-overlay" onClick={() => handleClickCard(null, null, clickedCardUniqueId)}>
          <div className="active-card-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => handleClickCard(null, null, clickedCardUniqueId)}>&times;</button>
            <h3 className="modal-title">Review Details for Entry ID: <span className="value-id">{renderData(activeCardData.id ? activeCardData.id.substring(0, 5) + '...' : 'N/A')}</span></h3>

            <div className="modal-content-grid">
              <p><strong>Created At:</strong> <span className="value">{renderData(new Date(activeCardData.created_at))}</span></p>
              <p><strong>Company Name:</strong> <span className="value">{renderData(activeCardData.company_name)}</span></p>
              <p><strong>Years Experience:</strong> <span className="value">{renderData(activeCardData.years_experience)}</span></p>
              <p><strong>Interview Duration:</strong> <span className="value">{renderData(activeCardData.interview_duration)}</span></p>
              <p><strong>Interview Stage:</strong> <span className="value">{renderData(activeCardData.interview_stage)}</span></p>
              <p><strong>Communication Rating:</strong> <span className="value">{renderData(activeCardData.communication_rating)}</span></p>
              <p><strong>Communication Reason:</strong> <span className="value">{renderData(activeCardData.communication_reason)}</span></p>
              <p><strong>Interviewer Experience:</strong> <span className="value">{renderData(activeCardData.interviewer_experience)}</span></p>
              <p><strong>Clarity on Role:</strong> <span className="value">{renderData(activeCardData.clarity_on_role)}</span></p>
              <p><strong>Clarity Explanation:</strong> <span className="value">{renderData(activeCardData.clarity_explain)}</span></p>
              <p><strong>Frustration Point:</strong> <span className="value">{renderData(activeCardData.frustration_point)}</span></p>
              <p><strong>Positive Aspect:</strong> <span className="value">{renderData(activeCardData.positive_aspect)}</span></p>
              <p><strong>Overall Rating:</strong> <span className="value">{renderData(activeCardData.overall_rating)}</span></p>
              <p><strong>One-line Summary:</strong> <span className="value">{renderData(activeCardData.one_line_summary)}</span></p>
              <p><strong>Opt-in to be Contacted:</strong> <span className="value">{renderData(activeCardData.opt_in_to_be_ === true ? 'Yes' : 'No')}</span></p>
              <p><strong>Email:</strong> <span className="value">{renderData(activeCardData.email)}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
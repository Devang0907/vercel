import React, { useState } from "react";
import "./SimpleForm.css"; // Assume your CSS is here

const SimpleForm = () => {
  const [gitURL, setGitURL] = useState(""); // State for the input field
  const [response, setResponse] = useState(null); // State for the server's response
  const [loading, setLoading] = useState(false); // State for loading
  const [showResponse, setShowResponse] = useState(false); // State for showing response after delay

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    const apiUrl = "http://localhost:9000/project"; // Your API server URL

    try {
      setLoading(true); // Start loading
      setShowResponse(false); // Reset response display

      // Send POST request to your API server
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gitURL }), // Send gitURL in the request body
      });

      const result = await res.json(); // Parse the JSON response
      setResponse(result); // Set the response to state

      // Wait for 20 seconds before showing the response
      setTimeout(() => {
        setShowResponse(true); // Show the response after delay
        setLoading(false); // Stop loading
      }, 60000); // 20000 milliseconds = 20 seconds

    } catch (error) {
      console.error("Error during API request:", error);
      setLoading(false); // Stop loading on error
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-box">
        <input
          type="text"
          value={gitURL}
          onChange={(e) => setGitURL(e.target.value)}
          placeholder="Enter Git Repository URL"
        />
        <button type="submit">Submit</button>
      </form>

      <div className="response-box">
        {loading && <p>Loading... Please wait...</p>}
        {loading && <div className="progress-bar"></div>} {/* Display progress bar */}

        {/* Display the server response after 20 seconds */}
        {showResponse && response && (
          <div>
            <h3>Your project hosted.</h3>
            <p>Project ID: {response.data?.projectSlug}</p>
            <p>
              Project URL:{" "}
              <a href={response.data?.url} target="_blank" rel="noopener noreferrer">
                {response.data?.url}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleForm;

import React from "react";

const Search = ({ search, setSearch }) => {
  return (
    <div className="search">
      <div>
        <img src="./search.svg" alt="search" />
        <input
          type="text"
          placeholder="Search through 1000+ movies"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search && (
          <img
            src="./cancel.svg"
            alt="Cancel"
            className="cancel-icon"
            onClick={() => setSearch("")}
          />
        )}
      </div>
    </div>
  );
};

export default Search;

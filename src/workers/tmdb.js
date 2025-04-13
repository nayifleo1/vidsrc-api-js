import dotenv from 'dotenv';

dotenv.config();
const apiToken = process.env.TMDB_API_KEY;

const fetchOptions = {
    headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
    }
};

export async function getMovieFromTmdb(tmdb_id) {
    try {
        const url = `https://api.themoviedb.org/3/movie/${tmdb_id}`;
        const response = await fetch(url, fetchOptions);
        const data = await response.json();

        // Check if we got an error response from TMDB
        if (data.success === false) {
            return new Error(data.status_message || "Movie not found");
        }

        // Check if we have the required data
        if (!data.original_title) {
            return new Error("Invalid movie data received");
        }

        if (new Date(data.release_date) > new Date().getTime()) {
            return new Error("Media not released yet");
        }

        let info = {
            type: "movie",
            title: data.original_title,
            releaseYear: data.release_date ? Number(data.release_date.split("-")[0]) : null,
            tmdbId: tmdb_id,
            imdbId: data.imdb_id || null  // Make imdb_id optional
        }
        return info;
    } catch (e) {
        return new Error("An error occurred: " + e.message);
    }
}

export async function getTvFromTmdb(tmdb_id, season, episode) {
    try {
        const url = `https://api.themoviedb.org/3/tv/${tmdb_id}/season/${season}/episode/${episode}?append_to_response=external_ids`;
        const response = await fetch(url, fetchOptions);
        const data = await response.json();

        // Check if we got an error response from TMDB
        if (data.success === false) {
            return new Error(data.status_message || "TV episode not found");
        }

        if (new Date(data.air_date) > new Date().getTime()) {
            return new Error("Not released yet");
        }

        // Fetch show details
        const showResponse = await fetch(`https://api.themoviedb.org/3/tv/${tmdb_id}`, fetchOptions);
        const showData = await showResponse.json();

        // Check if show data is valid
        if (!showData.name) {
            return new Error("Invalid TV show data received");
        }

        let info = {
            type: "tv",
            title: showData.name,
            releaseYear: data.air_date ? data.air_date.split("-")[0] : null,
            tmdbId: tmdb_id,
            imdbId: data.external_ids?.imdb_id || null,  // Make imdb_id optional and use optional chaining
            season: season,
            episode: episode,
            episodeName: data.name || `Episode ${episode}`
        }
        return info;
    } catch (e) {
        return new Error("An error occurred: " + e.message);
    }
}

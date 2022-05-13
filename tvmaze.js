'use strict';

const $showsList = $('#shows-list');
const $episodesArea = $('#episodes-area');
const $searchForm = $('#search-form');

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term) {
	// ADD: Remove placeholder & make request to TVMaze search shows API.
	const url = `http://api.tvmaze.com/search/shows?q=<${term}>`;
	let res = await axios.get(url);
	let shows = res.data.map((result) => {
		let show = result.show;
		return {
			id      : show.id,
			name    : show.name,
			summary : show.summary,
			image   : show.image ? show.image.medium : 'noimage.png'
		};
	});
	return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
	const $showsList = $('#shows-list');
	$showsList.empty();

	for (let show of shows) {
		const $show = $(
			`<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}"
              alt="${show.name} "
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn episodes btn-outline-dark btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
		);
		$showsList.append($show);
	}
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
	const term = $('#search-query').val();
	const shows = await getShowsByTerm(term);
	populateShows(shows);
}

$searchForm.on('submit', async function(evt) {
	const input = document.querySelector('#search-query');
	evt.preventDefault();
	await searchForShowAndDisplay();
	getShowsByTerm(input.value);
	$('.episodes').on('click', function() {
		const parentDiv = $(this).parent().parent().parent()[0];
		const id = $(parentDiv).attr('data-show-id');
		const ul = $('<ul>');
		ul.addClass('ul');
		$('.media').append(ul);
		getEpisodesOfShow(id);
	});
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
	const url = `https://api.tvmaze.com/shows/${id}/episodes`;
	let res = await axios.get(url);
	let episodes = res.data.map((episode) => {
		return {
			id      : episode.id,
			season  : episode.season,
			number  : episode.number,
			name    : episode.name,
			summary : episode.summary,
			image   : episode.image ? episode.image.medium : 'noimage.png'
		};
	});
	// console.log(episodes);
	populateEpisodes(episodes);
	return episodes;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
	const $episodeList = $('#episodes-list');
	for (let episode of episodes) {
		let $list = $(`<li> <b> ${episode.name} </b>: Season ${episode.season}, Episode ${episode.number}</li>`);
		$episodeList.append($list);
	}
	$episodesArea.show();
}

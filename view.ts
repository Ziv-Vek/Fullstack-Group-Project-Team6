// - Movie Cards - //
const movieCards = document.querySelector(".movieCards") as HTMLDivElement;
const movieCardsContainer = document.querySelector(".movieCards");
// (genreOptions function and filterMoviesByGenre function)
const secondarySearchArea = document.querySelector(
  ".search__secondary-search"
) as HTMLDivElement;
// Cinema menu search
const searchLocationMenu: NodeListOf<HTMLDivElement> =
  document.querySelectorAll(".search__location-menu");
// Date menu search
const searchDateMenu = document.querySelector(
  ".search__date-menu"
) as HTMLUListElement;
// Genre menu search
const searchGenreMenu = document.querySelector(
  ".search__genre-menu"
) as HTMLUListElement;
// Movies menu search
const searchMoviesMenu = document.querySelector(
  ".search__movies-menu"
) as HTMLUListElement;
// genre secondary dropdown list
const genreSecondaryDropdown = document.querySelector(
  ".search__genre-dropdown"
) as HTMLDivElement;
// cinema secondary dropdown list
const cinemaSecondaryDropdown = document.querySelector(
  ".search__secondary-dropdown-cinemas"
) as HTMLDivElement;
const datesSecondaryDropdown = document.querySelector(
  ".search__dates-dropdown"
) as HTMLDivElement;
// VIP button
const vipButton = document.querySelector(".vipButton");

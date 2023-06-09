var _this = this;
/**Responsible for showing and cycling through movie images in the page header */
var HeaderManager = /** @class */ (function () {
    function HeaderManager() {
        this.currentIndex = 0;
        this.fadeOutInterval = 700;
        this.switchImageInterval = 5000;
    }
    HeaderManager.prototype.showImage = function (index) {
        if (carousel) {
            carousel.classList.add("fade-in");
            imageContainers.forEach(function (container, i) {
                container.classList.remove("active");
                container.classList.add(i === index ? "active" : "middle");
            });
            setTimeout(function () {
                carousel.classList.remove("fade-in");
            }, this.fadeOutInterval);
        }
    };
    HeaderManager.prototype.startTimer = function () {
        var _this = this;
        setInterval(function () {
            _this.currentIndex = (_this.currentIndex + 1) % imageContainers.length;
            _this.showImage(_this.currentIndex);
        }, this.switchImageInterval);
    };
    return HeaderManager;
}());
/** Responsible for the rendering and logic of a movie card */
var MovieCardManager = /** @class */ (function () {
    function MovieCardManager() {
    }
    return MovieCardManager;
}());
// Render movie cards -
var renderMovieCards = function (movies) {
    var movieCardsHTML = "";
    movies.forEach(function (movie) {
        movieCardsHTML += "<div class=\"movieCard\">\n    <div class=\"movieImage\">\n      <img src=\"" + movie.image + "\" />\n    </div>\n    <div class=\"movieDetails\">\n      <h2 class=\"movieDetails__movieName\">" + movie.name + "</h2>\n      <span onclick=\"openTrailer('" + movie.uuid + "')\" id=\"trailerBtn\" class=\"material-symbols-outlined movieDetails__trailerButton\">play_circle</span>\n      <p class=\"movieDetails__movieDescription\">" + movie.description + "</p>\n\n      <div class=\"movieDetails__moreInfo\">\n      <p class=\"movieDetails__genre\">Genre: " + movie.genre.join(", ") + "</p>\n      <p class=\"movieDetails__ageLimit\">Age Limit: " + movie.ageLimit + "</p>\n      <p class=\"movieDetails__screenDuration\">Screen Duration: " + movie.screenDuration + "</p>\n      <p class=\"movieDetails__premiere\">Premiere: " + movie.premiere + "</p>\n   </div>\n\n      <div class=\"movieDetails__hours-container\">\n      " + generateHoursHtml(movie.uuid) + "\n      \n      </div>\n      <a class=\"movieDetails__moviePageButton\" href=\"./moviePage/moviePage.html?id=" + movie.uuid + "\" onclick=\"transferMovieData(event, " + movie.uuid + ")\">MOVIE PAGE</a>\n    </div>\n  </div>";
    });
    movieCardsContainer.innerHTML = movieCardsHTML;
};
var generateHoursHtml = function (movieUuid) {
    var cinema = searchHandler.getSelectedCinema;
    var screenTimes = [];
    var screenUuid = [];
    if (cinema === null) {
        return "";
    }
    var movieListLenght = cinema.movieList.length;
    for (var i = 0; i < movieListLenght; i++) {
        var movieInstance = cinema.movieList[i];
        if (movieInstance.movieID === movieUuid) {
            screenTimes.push(movieInstance.screenTime);
            screenUuid.push(movieInstance.uuid);
        }
    }
    var screenUuidIndex = -1;
    var html = screenTimes
        .map(function (screenTime) {
        screenUuidIndex++;
        return "<a\n       class=\"movieDetails__hour\"\n       onclick=\"onHourSelection(" + movieUuid + ", " + cinema.id + ", '" + screenTime + "', " + screenUuid[screenUuidIndex] + ")\"\n       href=\"./venueScreen.html\"\n       >\n       " + screenTime + "\n     </a>\n    ";
    })
        .join(" ");
    return html;
};
var onHourSelection = function (movieUuid, cinemaId, screenTime, screenUuid) {
    setData("selectedMovie", movieUuid + ", " + cinemaId + ", " + screenTime + ", " + screenUuid);
};
// Open trailer -
var openTrailer = function (mov) {
    var selectedMovie = movies.find(function (element) { return element.uuid === Number(mov); });
    console.log();
    var popup = "<div class=\"trailer_container\">\n  <div class=\"trailer_container__exitBox\">\n  <div class=\"trailer_container-exit\" onclick=\"closePopup()\">\n  <span class=\"material-symbols-outlined trailer_container-exitBtn\">\n  close\n  </span>\n  </div>\n  <div class=\"trailer_container-content\">\n    <h2>" + selectedMovie.name + "</h2>\n    <iframe  width=\"640\" height=\"360\" \n      src=\"" + selectedMovie.trailerURL + "\"\n      frameborder=\"0\"\n    ></iframe>\n  </div>\n  </div>\n</div>";
    var movieCardsContainer = document.querySelector(".trailer_popup");
    movieCardsContainer.innerHTML += popup;
};
// Close trailer popup -
var closePopup = function () {
    document.querySelector(".trailer_container").remove();
};
// Transfer data to movie page -
var transferMovieData = function (event, movieId) {
    event.preventDefault();
    var movie = _this.movies.find(function (movie) { return movie.uuid === movieId; });
    if (movie) {
        var movieData = movie;
        var movieDataString = encodeURIComponent(JSON.stringify(movieData));
        var moviePageURL = "./moviePage/moviePage.html?data=" + movieDataString;
        window.location.href = moviePageURL;
    }
};
var populateMoviePage = function (movie) {
    document.querySelector("#movieImage").innerHTML = "<img src=\"../" + movie.image + "\" class=\"movie-image\"/>";
    document.querySelector("#movieTitle").textContent = movie.name;
    document.querySelector("#movieDescription").textContent = movie.description;
    document.querySelector("#movieGenre").textContent = movie.genre.join(", ");
    document.querySelector("#movieAgeLimit").textContent =
        movie.ageLimit.toString();
    document.querySelector("#movieDuration").textContent =
        "Duration in Minutes: " + movie.screenDuration.toString();
    document.querySelector("#moviePremiere").textContent =
        "Premiere: " + movie.premiere.toString();
    var movieTrailerContainer = document.querySelector("#movieTrailer");
    var iframe = document.createElement("iframe");
    iframe.src = movie.trailerURL;
    iframe.allowFullscreen = true;
    iframe.width = "500px";
    iframe.height = "300px";
    movieTrailerContainer.appendChild(iframe);
};
/** Handles user search selections */
var SearchHandler = /** @class */ (function () {
    function SearchHandler() {
        this.selectedCinema = null;
        this.selectedDate = null;
        this.selectedGenre = null;
        this.filteredMovies = [];
        this.locationFilterText = null;
        this.dateFilterText = null;
    }
    Object.defineProperty(SearchHandler.prototype, "getFilteredMoviesByLocation", {
        get: function () {
            return this.filteredMovies;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SearchHandler.prototype, "getSelectedCinema", {
        get: function () {
            return this.selectedCinema;
        },
        enumerable: false,
        configurable: true
    });
    SearchHandler.prototype.onLocationSelect = function (searchFilter, location, eve, isPrimarySearch) {
        try {
            if (searchFilter === "")
                throw new Error("No search filter was passed");
            if (location === "")
                throw new Error("No location filter selection was passed");
            if (!searchFieldsRenderer)
                throw new Error("searchFieldsRenderer not found");
            searchFieldsRenderer.updateSearchTitle(searchFilter, location);
            this.locationFilterText = location;
            if (!isPrimarySearch) {
                searchFieldsRenderer.populateDates(this.translateCinemaNameToCinema(location), false);
            }
            else {
                this.filteredMovies = this.filterMoviesByCinemas(location);
                if (this.filteredMovies.length === 0) {
                    renderMovieCards(movies);
                }
                else {
                    renderMovieCards(this.filteredMovies);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    };
    SearchHandler.prototype.translateCinemaNameToCinema = function (cinemaName) {
        var allCinemas = getData("cinemaData");
        var allCinemasLenght = allCinemas.length;
        for (var i = 0; i < allCinemasLenght; i++) {
            if (allCinemas[i].cinemaName === cinemaName) {
                return allCinemas[i];
            }
        }
    };
    SearchHandler.prototype.onMovieSelect = function (searchFilter, movieUuid, eve) {
        var filteredMovies = [];
        var moviesLenght = movies.length;
        for (var i = 0; i < moviesLenght; i++) {
            if (movies[i].uuid === Number(movieUuid)) {
                filteredMovies.push(movies[i]);
                break;
            }
        }
    };
    SearchHandler.prototype.onDateSelect = function (searchFilter, dateTimeStamp, eve, cinemaName, isPrimarySearch) {
        var newDate = new Date(dateTimeStamp);
        searchFieldsRenderer.updateDateSearchTitle(searchFilter, newDate);
        if (isPrimarySearch)
            renderMovieCards(this.filterMoviesByDate(newDate));
        else
            moviePageRenderer.renderScreenings(dateTimeStamp, this.translateCinemaNameToCinema(cinemaName));
    };
    SearchHandler.prototype.onGenreSelect = function (searchFilter, genre, eve) {
        searchFieldsRenderer.updateSearchTitle(searchFilter, genre);
        renderMovieCards(this.filterMoviesByGenre(genre));
    };
    SearchHandler.prototype.filterMoviesByCinemas = function (location) {
        var filteredMovies = [];
        var _loop_1 = function (cinema) {
            if (cinema.cinemaName === location) {
                var allMoviesIdInCinema_1 = [];
                this_1.selectedCinema = cinema;
                cinema.movieList.forEach(function (movie) {
                    allMoviesIdInCinema_1.push(movie.movieID);
                });
                var uniqueMoviesIdInCinema_1 = new Set(allMoviesIdInCinema_1);
                movies.forEach(function (movie) {
                    uniqueMoviesIdInCinema_1.forEach(function (idByCinema) {
                        if (idByCinema === movie.uuid) {
                            filteredMovies.push(movie);
                        }
                    });
                });
                this_1.filteredMovies = filteredMovies;
                searchFieldsRenderer.renderSecondarySearchMenus(this_1.selectedCinema, null);
                return { value: filteredMovies };
            }
        };
        var this_1 = this;
        for (var _i = 0, cinemas_1 = cinemas; _i < cinemas_1.length; _i++) {
            var cinema = cinemas_1[_i];
            var state_1 = _loop_1(cinema);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return filteredMovies;
    };
    SearchHandler.prototype.filterMoviesByDate = function (newDate) {
        var _a;
        var filteredMoviesByDate = [];
        (_a = this.selectedCinema) === null || _a === void 0 ? void 0 : _a.movieList.forEach(function (movieInCinema) {
            var movieScreenDateArr = movieInCinema.screenDate.split(" ");
            if (Number(movieScreenDateArr[0]) === newDate.getMonth() + 1 &&
                Number(movieScreenDateArr[1]) === newDate.getDate()) {
                filteredMoviesByDate.push(movieInCinema);
            }
        });
        var filteredMoviesByDateLengh = filteredMoviesByDate.length;
        var filteredMoviesLengh = this.filteredMovies.length;
        var filteredMoviesByCinemaAndDate = [];
        for (var i = 0; i < filteredMoviesByDateLengh; i++) {
            for (var j = 0; j < filteredMoviesLengh; j++) {
                if (filteredMoviesByDate[i].movieID === this.filteredMovies[j].uuid) {
                    filteredMoviesByCinemaAndDate.push(this.filteredMovies[j]);
                }
            }
        }
        return filteredMoviesByCinemaAndDate;
    };
    //private filterScreeningHoursByDate() {}
    SearchHandler.prototype.filterMoviesByGenre = function (selectedGenre) {
        var filteredMovies = [];
        var filteredMoviesLengh = this.filteredMovies.length;
        for (var i = 0; i < filteredMoviesLengh; i++) {
            var movieGenresLengh = this.filteredMovies[i].genre.length;
            for (var j = 0; j < movieGenresLengh; j++) {
                if (this.filteredMovies[i].genre[j] === selectedGenre) {
                    filteredMovies.push(this.filteredMovies[i]);
                    break;
                }
            }
        }
        return filteredMovies;
    };
    return SearchHandler;
}());
/** Responsible for rendering the search fields */
var SearchFieldsRenderer = /** @class */ (function () {
    function SearchFieldsRenderer() {
        this.movies = [];
        this.numOfDaysInDateSearch = 14;
    }
    SearchFieldsRenderer.prototype.updateSearchTitle = function (searchFilter, newTitle) {
        var selector = document.querySelector("." + searchFilter);
        selector.children[0].innerHTML = newTitle;
    };
    SearchFieldsRenderer.prototype.updateDateSearchTitle = function (searchFilter, date) {
        var selector = document.querySelector("." + searchFilter);
        selector.children[0].innerHTML = " " + date.toLocaleString("default", {
            weekday: "short",
            day: "2-digit",
            month: "short"
        }) + " ";
    };
    SearchFieldsRenderer.prototype.renderSecondarySearchMenus = function (selectedCinema, selectedMovie) {
        if (selectedCinema) {
            if (!secondarySearchArea.classList.contains("search__secondary-search--visible"))
                secondarySearchArea.classList.add("search__secondary-search--visible");
            if (genreSecondaryDropdown.classList.contains("search__secondary-search--invisible"))
                genreSecondaryDropdown.classList.remove("search__secondary-search--invisible");
            if (datesSecondaryDropdown.classList.contains("search__secondary-search--invisible"))
                datesSecondaryDropdown.classList.remove("search__secondary-search--invisible");
            this.populateDates(selectedCinema, true);
            this.populateGenres(selectedCinema);
        }
        if (selectedMovie) {
            if (!secondarySearchArea.classList.contains("search__secondary-search--visible"))
                secondarySearchArea.classList.add("search__secondary-search--visible");
            if (cinemaSecondaryDropdown.classList.contains("search__secondary-search--invisible"))
                cinemaSecondaryDropdown.classList.remove("search__secondary-search--invisible");
            this.populateLocations(getData("cinemaData"), false);
        }
    };
    SearchFieldsRenderer.prototype.populateDates = function (selectedCinema, isPrimarySearch) {
        var currentDayInMonth = new Date().getDate();
        var lastSearchDay = currentDayInMonth + this.numOfDaysInDateSearch;
        var today = new Date();
        var availableDates = [];
        selectedCinema.movieList.forEach(function (movie) {
            if (!availableDates.includes(movie.screenDate)) {
                availableDates.push(movie.screenDate);
            }
        });
        searchDateMenu.innerHTML = "";
        var availableDatesLengh = availableDates.length;
        if (availableDatesLengh === 0) {
            searchDateMenu.innerHTML = "No screening days found";
        }
        else {
            for (var i = 0; i < availableDatesLengh; i++) {
                var newDate = new Date(availableDates[i]);
                searchDateMenu.innerHTML += "<li>\n        <a\n          class=\"dropdown-item\"\n\n          onclick=\"searchHandler.onDateSelect('search__dates-dropdown', '" + newDate + "', event, '" + selectedCinema.cinemaName + "', " + isPrimarySearch + ")\"\n          >" + newDate.toLocaleString("default", {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }) + "</a>\n      </li>";
            }
        }
    };
    SearchFieldsRenderer.prototype.populateGenres = function (selectedCinema) {
        var availableGenres = [];
        var filteredMovies = searchHandler.getFilteredMoviesByLocation;
        filteredMovies.forEach(function (movie) {
            movie.genre.forEach(function (movieGenre) {
                if (!availableGenres.includes(movieGenre)) {
                    availableGenres.push(movieGenre);
                }
            });
        });
        searchGenreMenu.innerHTML = "";
        searchGenreMenu.innerHTML = availableGenres
            .map(function (genre) {
            return "<li>\n        <a\n          class=\"dropdown-item\"\n          onclick=\"searchHandler.onGenreSelect('search__genre-dropdown', '" + genre + "', event)\"\n          >" + genre + "</a>\n      </li>";
        })
            .join("");
    };
    SearchFieldsRenderer.prototype.populateLocations = function (cinemas, isPrimarySearch) {
        this.cinemas = cinemas;
        for (var i = 0; i < searchLocationMenu.length; i++) {
            searchLocationMenu[i].innerHTML = cinemas
                .map(function (cinema) {
                return "<li>\n        <a\n          class=\"dropdown-item\"\n          onclick=\"searchHandler.onLocationSelect('search__cinemas-dropdown', '" + cinema.cinemaName + "', event, " + isPrimarySearch + ")\"\n          >" + cinema.cinemaName + "</a>\n      </li>";
            })
                .join("");
        }
    };
    SearchFieldsRenderer.prototype.populateMovies = function (movies) {
        this.movies = movies;
        searchMoviesMenu.innerHTML = movies
            .map(function (movie) {
            return "<li>\n      <a class=\"dropdown-item\" href=\"./moviePage/moviePage.html?id=" + movie.uuid + "\" onclick=\"transferMovieData(event, " + movie.uuid + ")\">" + movie.name + "</a>\n    </li>";
        })
            .join("");
    };
    return SearchFieldsRenderer;
}());
// VIP -
vipButton === null || vipButton === void 0 ? void 0 : vipButton.addEventListener("click", function () {
    window.location.href = "./vipPage/vip.html";
});
var MoviePageManager = /** @class */ (function () {
    function MoviePageManager() {
    }
    return MoviePageManager;
}());
var MoviePageRenderer = /** @class */ (function () {
    function MoviePageRenderer(movieUuid, allCinemas) {
        this.movieUuid = movieUuid;
        this.allCinemas = allCinemas;
        this.allCinemas = [];
        this.movieUuid = movieUuid;
        this.allCinemas = allCinemas;
    }
    MoviePageRenderer.prototype.renderScreenings = function (screeningTimeStamp, cinema) {
        var _this = this;
        var screeningTime = new Date(screeningTimeStamp);
        var screeningUuid = [];
        cinema.movieList.forEach(function (screeningInstance) {
            if (screeningInstance.movieID === _this.movieUuid) {
                screeningUuid.push(screeningInstance);
            }
        });
        screeningWrapperDiv.innerHTML = "\n    <div class=\"screening\">\n        <p class=\"screening__cinema\">" + cinema.cinemaName + "</p>\n        <p class=\"screening__date\">\n        " + screeningTime.toLocaleString("default", {
            weekday: "long",
            day: "2-digit",
            month: "short"
        }) + "\n        </p>\n        <div class=\"screening__hours-container\">" + this.generateScreeningHoursHtml(cinema) + "\n        </div>\n      </div>\n      ";
    };
    MoviePageRenderer.prototype.generateScreeningHoursHtml = function (cinema) {
        var _this = this;
        var screenTimes = [];
        var screenUuid = [];
        if (cinema === null) {
            return "";
        }
        var movieListLenght = cinema.movieList.length;
        for (var i = 0; i < movieListLenght; i++) {
            var movieInstance = cinema.movieList[i];
            if (movieInstance.movieID === this.movieUuid) {
                screenTimes.push(movieInstance.screenTime);
                screenUuid.push(movieInstance.uuid);
            }
        }
        var screenUuidIndex = -1;
        var html = screenTimes
            .map(function (screenTime) {
            screenUuidIndex++;
            return "<a\n       class=\"screening__hour\"\n       onclick=\"onHourSelection(" + _this.movieUuid + ", " + cinema.id + ", '" + screenTime + "', " + screenUuid[screenUuidIndex] + ")\"\n       href=\"../venueScreen.html\"\n       >\n       " + screenTime + "\n     </a>\n    ";
        })
            .join(" ");
        return html;
    };
    return MoviePageRenderer;
}());

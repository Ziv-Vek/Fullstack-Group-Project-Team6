/// Present screening details in Navbar
const screeningDetails = document.querySelector(".screening") as HTMLDivElement;

interface Seat {
  line: number;
  seatID: number;
  isTaken: boolean;
}

const selectedScreeningRaw = getData("selectedMovie").split(", ");
const cinemas = getData("cinemaData");
const selectedCinema = cinemas.find(
  (result) => result.id === Number(selectedScreeningRaw[1])
);
const movies: Movie[] = getData("movieData");
const selectedMovie: Movie | undefined = movies.find(
  (result) => result.uuid === Number(selectedScreeningRaw[0])
);

const selectedScreening = selectedCinema.movieList.find(
  (result) => result.uuid === Number(selectedScreeningRaw[3])
);

console.log(selectedScreening);

function renderDetails(element: HTMLDivElement, renderDetails: string) {
  element.innerHTML = renderDetails;
}

const html = document.querySelector(".venue_view") as HTMLDivElement;
const movieDetails = document.querySelector(".movie_details") as HTMLDivElement;
const venueData: Seat[] = [];

const renderScreeningInNavbar = (
  selectedMovie: Movie,
  selectedCinema: Cinema,
  selectedScreening: any
) => {
  const screeningDate = new Date(selectedScreening.screenDate);
  const dateString: string = screeningDate.toLocaleString("default", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  console.log(selectedScreening);

  screeningDetails.innerHTML = `<img
  src="${selectedMovie.image}"
  class="screening__movie-img" />
  <div class="screening__text-container">
  <p class="screening__text-container__title">${selectedMovie.name}</p>
  <p class="screening__text-container__details">${selectedCinema.cinemaName}</p>
  <p class="screening__text-container__details">${dateString}, ${selectedScreening.screenTime} </p>
  <p class="screening__text-container__details">Venue ${selectedScreening.venue} </p>
  </div>`;
};

renderScreeningInNavbar(selectedMovie, selectedCinema, selectedScreening);

const selectedSeats: { line: number; seat: number }[] = [];
fetch("venue.json")
  .then((response) => response.json())
  .then((data) => {
    const venue = data[0];

    venue.seats.forEach((seat: any) => {
      venueData.push({
        line: seat.line,
        seatID: seat.seatID,
        isTaken: seat.isTaken,
      });
    });
    updateSeatTakenStatus(venueData, selectedScreening.seats.index);
    seatsRender(venueData);
    enableSeatsSelection();
    handlePaymentForm(Event);
  })
  .catch((error) => console.log(error));

function updateSeatTakenStatus(seats: Seat[], selectionIndex: any[]) {
  seats.forEach((seat) => {
    const foundIndex = selectionIndex.findIndex(
      (data) => seat.line === data.line && seat.seatID === data.seatID
    );
    seat.isTaken = foundIndex !== -1;
  });
}

function seatsRender(seats: Seat[]) {
  const lineSeatsMap: Record<number, number> = {
    1: 10,
    2: 10,
    3: 10,
    4: 12,
    5: 14,
    6: 14,
  };

  const lineElements: HTMLElement[] = [];

  for (let line = 1; line <= 6; line++) {
    const seatsPerLine = lineSeatsMap[line] || 0;

    const lineElement = document.createElement("div");
    lineElement.classList.add("venue__line");

    for (let seat = 1; seat <= seatsPerLine; seat++) {
      const foundSeat = seats.find((s) => s.line === line && s.seatID === seat);
      const isSelected = selectedSeats.some(
        (s) => s.line === line && s.seat === seat
      );

      const isTaken = foundSeat ? foundSeat.isTaken : false;
      seatsRenderTaken(isTaken, isSelected, lineElement, seat, line);
    }

    lineElements.push(lineElement);
  }

  html.append(...lineElements);
}

function seatsRenderTaken(
  isTaken: boolean,
  isSelected: boolean,
  element: HTMLElement,
  seat: number,
  line: number
) {
  const seatElement = document.createElement("div");

  seatElement.classList.add("venue__seat");
  seatElement.classList.add(`${line}-${seat}`);
  seatElement.textContent = `${seat}`;

  if (isTaken) {
    seatElement.classList.replace("venue__seat", "venue__seat--taken");
  } else if (isSelected) {
    seatElement.style.backgroundColor = "rgb(150, 247, 140)";
  }

  element.appendChild(seatElement);
}

const enableSeatsSelection = () => {
  const allSeats: NodeListOf<HTMLElement> =
    document.querySelectorAll(".venue__seat");

  allSeats.forEach((seat) => {
    seat.addEventListener("click", () => {
      const selectedSeat: string[] = seat.classList[1].split("-");
      const line = Number(selectedSeat[0]);
      const seatID = Number(selectedSeat[1]);

      const seatIndex = selectedSeats.findIndex(
        (rs) => rs.line === line && rs.seat === seatID
      );

      const isSeatTaken = seat.classList.contains("venue__seat--taken");

      if (isSeatTaken) {
        return seatErrorMessage;
      }

      if (seatIndex !== -1) {
        selectedSeats.splice(seatIndex, 1); // Remove the selected seat from the array
        seat.style.backgroundColor = "white";
      } else {
        seat.style.backgroundColor = "rgb(150, 247, 140)";
        selectedSeats.push({
          line,
          seat: seatID,
        });
      }
      console.log(selectedSeats);
    });
  });
};

/////////////////////////////////////////////////////
const orderBtn = document.querySelector(
  ".order-container__order-btn"
) as HTMLButtonElement;
const paymentForm = document.querySelector(".credit-form") as HTMLFormElement;
const seatErrorMessage = document.querySelector(
  ".seat-error-message"
) as HTMLDivElement;

orderBtn.addEventListener("click", () => {
  if (selectedSeats.length === 0) {
    seatErrorMessage.style.display = "block";
  } else {
    seatErrorMessage.style.display = "none";
    paymentForm.style.display = "block";
  }
});

/////////////////////////////////////////////////////
const loadingContainer = document.querySelector(
  ".loading-container"
) as HTMLDivElement;
const ticketContainer = document.querySelector(
  ".ticket-container"
) as HTMLDivElement;
const notNumberMessage = document.querySelector(
  ".notNumberError"
) as HTMLSpanElement;
const submitButton = document.querySelector("#submit") as HTMLInputElement;

let forms: PayForm[] = [];

const handlePaymentForm = (evt) => {
  try {
    evt.preventDefault();

    const name = evt.target.elements.name.value;
    const email = evt.target.elements.email.value;
    const idNumber = parseInt(evt.target.elements.idNumber.value, 10);
    const cardNumber = parseInt(evt.target.elements.cardNumber.value, 10);
    const month = parseInt(evt.target.elements.month.value, 10);
    const year = parseInt(evt.target.elements.year.value, 10);

    if (isNaN(idNumber) || isNaN(cardNumber) || isNaN(month) || isNaN(year)) {
      notNumberMessage.style.display = "block";
      return;
    }

    forms.push(
      new PayForm(
        name,
        email,
        idNumber.toString(),
        cardNumber.toString(),
        month.toString(),
        year.toString()
      )
    );
    console.dir(forms);

    notNumberMessage.style.display = "none";
    displayMovieTicket();
  } catch (error) {
    console.log(error);
  }
};

const displayMovieTicket = () => {
  const selectedLines = selectedSeats.reduce((lines: number[], seat: any) => {
    if (!lines.includes(seat.line)) {
      lines.push(seat.line);
    }
    return lines;
  }, []);

  const ticketHTML = `
 <div class="ticket">
     <img class="ticket__TImage" src="./vipPage/ticket-no-bg.png" />

     <span onclick="closeTicket()" class="material-symbols-outlined ticket__exit">
       close
     </span>

     <div class="ticket__image">
     <img src="${selectedMovie!.image}" />
     </div>
   
    <div class="ticket__Details">
        <h2 class="ticket__name">${selectedMovie!.name}</h2>

        <div class="ticket__screenDate1">${selectedScreening.screenDate}</div>
        <div class="ticket__screenTime1">${selectedScreening.screenTime}</div>
        <div class="ticket__cinema"> Cinema ${selectedCinema.cinemaName} </div>
        <img class="ticket__scan1" src="../vipPage/scanTicket.png" />
    
       <div class="ticket__screenDate2">${selectedScreening.screenDate}</div>
       <div class="ticket__screenTime2">${selectedScreening.screenTime}</div>

       <span class="ticket__labelVenue"> Venue </span>
       <span class="ticket__labelLine"> Line </span>
       <span class="ticket__labelSeats"> Seats </span>

        <div class="ticket__venue"> ${selectedScreening.venue}</div>
        <div class="ticket__line"> ${selectedLines.join(", ")}</div>
        <div class="ticket__seats"> ${selectedSeats
          .map((seat) => `${seat.seat}`)
          .join(", ")} </div>

        <img class="ticket__scan2" src="../vipPage/scanTicket.png" />

        <span class="ticket__mailMessage"> A Copy Of Your Tickets Was Sent To Your Email ! </span>
    </div>
  </div>`;

  ticketContainer.innerHTML = ticketHTML;
  ticketContainer.style.display = "block";
  paymentForm.style.display = "none";
};

function closeTicket() {
  document.querySelector(".ticket ")!.remove();
}

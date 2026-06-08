import type { GameConfig } from "../types";

export function mountConfigScreen(
  container: HTMLElement,
  onStart: (config: GameConfig) => void,
): void {
  container.innerHTML = `
    <div class="screen screen--config">
      <h1 class="title">🏎️ Jogo de Carrinhos</h1>
      <form class="config-form" id="config-form" novalidate>
        <div class="field">
          <label class="field__label" for="num-cars">Número de carrinhos</label>
          <div class="stepper">
            <button type="button" class="stepper__btn" data-action="dec" data-target="num-cars">−</button>
            <input
              class="stepper__input"
              id="num-cars"
              name="numCars"
              type="number"
              min="2"
              max="6"
              value="2"
              readonly
            />
            <button type="button" class="stepper__btn" data-action="inc" data-target="num-cars">+</button>
          </div>
        </div>

        <div class="field">
          <label class="field__label" for="finish-line">Casas até a chegada</label>
          <input
            class="field__input"
            id="finish-line"
            name="finishLine"
            type="number"
            min="2"
            max="100"
            value="5"
          />
          <span class="field__error" id="finish-error"></span>
        </div>

        <button class="btn btn--primary btn--lg" type="submit">Iniciar partida</button>
      </form>
    </div>
  `;

  const form = container.querySelector<HTMLFormElement>("#config-form")!;
  const numCarsInput = container.querySelector<HTMLInputElement>("#num-cars")!;
  const finishInput =
    container.querySelector<HTMLInputElement>("#finish-line")!;
  const finishError =
    container.querySelector<HTMLSpanElement>("#finish-error")!;

  container
    .querySelectorAll<HTMLButtonElement>(".stepper__btn")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseInt(numCarsInput.value, 10);
        const action = btn.dataset.action;
        if (action === "inc" && val < 6) numCarsInput.value = String(val + 1);
        if (action === "dec" && val > 2) numCarsInput.value = String(val - 1);
      });
    });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    finishError.textContent = "";

    const numCars = parseInt(numCarsInput.value, 10);
    const finishLine = parseInt(finishInput.value, 10);

    if (isNaN(finishLine) || finishLine < 2) {
      finishError.textContent = "Mínimo de 2 casas.";
      finishInput.focus();
      return;
    }
    if (finishLine > 100) {
      finishError.textContent = "Máximo de 100 casas.";
      finishInput.focus();
      return;
    }

    onStart({ numCars, finishLine });
  });
}

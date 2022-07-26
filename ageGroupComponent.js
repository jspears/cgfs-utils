(function () {
  function ageGroupFor(janAge) {
    if (janAge < 6) {
      return 6;
    }
    return janAge + (janAge % 2);
  }
  function formatDate(d) {
    return d?.toISOString().split("T")[0] ?? "";
  }
  class DateFormat extends HTMLElement {
    static observedAttributes = ["date", "dateStyle"];

    connectedCallback() {
      this.render();
    }
    attributeChangedCallback(name, oldValue, newValue) {
      this.render();
    }
    render() {
      const date = new Date(this.getAttribute("date") || Date.now());

      this.innerHTML = new Intl.DateTimeFormat("default", {
        dateStyle: this.getAttribute("dateStyle") || "medium",
      }).format(date);
    }
  }

  class AgeGroup extends HTMLElement {
    static defaultValues = {
      min: 4,
      max: 14,
      month: 11,
      date: 31,
      year: 0,
      birthdate: (v) => (v != null ? new Date(v) : v),
    };
    static get observedAttributes() {
      return Object.keys(this.defaultValues);
    }
    constructor() {
      super();
      for (const [key, def] of Object.entries(this.constructor.defaultValues)) {
        Object.defineProperty(this, key, {
          set(val) {
            if (val == null) {
              this.removeAttribute(val);
            }
            this.setAttribute(key, val);
          },
          get() {
            let convert = Number;
            let defValue = def;
            if (typeof defValue === "function") {
              convert = def;
              defValue = null;
            }
            return this.hasAttribute(key)
              ? convert(this.getAttribute(key))
              : defValue;
          },
        });
      }
    }
    get relTo() {
      const rel = new Date();
      rel.setDate(this.date);
      rel.setMonth(this.month);
      rel.setHours(23, 59, 59, 999);
      rel.setFullYear(rel.getFullYear() + this.year);
      return rel;
    }
    ago(years, relTo) {
      const t = new Date((relTo || this.relTo).getTime());
      t.setFullYear(t.getFullYear() - years);
      return t;
    }
    ageAt(birthDate, relTo) {
      return Math.abs(
        new Date(
          (relTo || this.relTo).getTime() - birthDate.getTime()
        ).getUTCFullYear() - 1970
      );
    }

    attributeChangedCallback() {
      this.render();
    }
    connectedCallback() {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.addEventListener("input", (e) => {
        const birthdate = this.birthdate;
        if (formatDate(birthdate) !== e.target.value) {
          this.birthdate = e.target.value;
        }
      });
      this.shadowRoot.addEventListener("focus", () => this.focus());

      this.render();
    }
    focus() {
      this.input?.focus();
    }
    get input() {
      return this.shadowRoot.querySelector("input");
    }
    set message(value) {
      return (this.shadowRoot.querySelector("p").innerHTML = value);
    }

    update() {
      const { input, relTo, birthdate } = this;
      input.min = formatDate(this.ago(this.max, relTo));
      input.max = formatDate(this.ago(this.min, relTo));
      input.value = formatDate(birthdate);
      this.message = "";
      const age = birthdate ? this.ageAt(birthdate, relTo) : null;

      if (age) {
        if (age < this.min) {
          this.message = `Sorry must be over ${this.min} by <fmt-date date="${relTo}"/>`;
          this.focus();

        } else if (age > this.max) {
          this.message = `Sorry must under ${this.max} on <fmt-date date="${relTo}"/>`;
          this.focus();
        } else {
          this.message = `${ageGroupFor(age, relTo)}U`;
        }
      }
    }
    render() {
      this.shadowRoot.innerHTML = `
    <style>
      p {
        font-weight: normal;
        padding: 1em;
       }
    </style>

    <input type="date"/>

    <p></p>
    `;
      this.update();
    }
  }
  window.customElements.define("age-group", AgeGroup);
  window.customElements.define("fmt-date", DateFormat);
})();

(function () {
  function ageGroupFor(janAge) {
    if (janAge < 6) {
      return 6;
    }
    return janAge + (janAge % 2);
  }
  function formatDate(d) {
    return d.toISOString().split("T")[0];
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
        dateStyle: this.getAttribute("dateStyle") || "short",
      }).format(date);
    }
  }

  class AgeGroup extends HTMLElement {
    static get observedAttributes() {
      return ["min", "max", "month", "date"];
    }
    get relTo() {
      const jan1st = new Date();
      jan1st.setDate(this.date);
      jan1st.setMonth(this.month);
      jan1st.setFullYear(jan1st.getFullYear() + 1);
      return jan1st;
    }
    ago(years) {
      const t = new Date(this.relTo.getTime());
      t.setFullYear(t.getFullYear() - years);
      return t;
    }
    ageAt(birthDate) {
      return Math.abs(
        new Date(this.relTo.getTime() - birthDate.getTime()).getUTCFullYear() -
          1970
      );
    }
    get month() {
      return this.hasAttribute("month")
        ? Number(this.getAttribute("month"))
        : 0;
    }
    set month(val) {
      this.setAttribute("month", val);
    }
    get date() {
      return this.hasAttribute("date") ? Number(this.getAttribute("date")) : 1;
    }
    set date(val) {
      this.setAttribute("date", val);
    }

    // connect component
    get min() {
      return this.hasAttribute("min") ? Number(this.getAttribute("min")) : 4;
    }
    set min(val) {
      if (val) {
        this.setAttribute("min", val);
      } else {
        this.removeAttribute("min");
      }
    }
    get max() {
      return this.hasAttribute("max") ? Number(this.getAttribute("max")) : 15;
    }

    set max(val) {
      if (val) {
        this.setAttribute("max", val);
      } else {
        this.removeAttribute("max");
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
      this.render();
    }
    connectedCallback() {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.addEventListener("input", (e) => {
        if (!e.target.value) {
          return;
        }
        const janAge = this.ageAt(new Date(e.target.value));
        const p = this.shadowRoot.querySelector("p");
        if (janAge < this.min) {
          p.innerHTML = `Sorry must be over ${this.min} by <fmt-date date="${this.relTo}"/>`;
        } else if (janAge > this.max) {
          p.innerHTML = `Sorry must under ${this.max} on <fmt-date date="${this.relTo}"/>`;
        } else {
          p.innerHTML = `${ageGroupFor(janAge)}U`;
        }
      });

      this.render();
    }
    render() {
      this.shadowRoot.innerHTML = `
    <style>
      p {
        font-weight: normal;
        padding: 1em;
       }
    </style>

    <input type="date" min="${formatDate(
      this.ago(this.max)
    )}" max="${formatDate(this.ago(this.min))}"/>
    <p></p>
    `;
    }
  }
  window.customElements.define("age-group", AgeGroup);
  window.customElements.define("fmt-date", DateFormat);
  console.log("loaded");
})();

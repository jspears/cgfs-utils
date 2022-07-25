(function () {
  const Jan1st = new Date();
  Jan1st.setDate(1);
  Jan1st.setMonth(0);
  Jan1st.setFullYear(Jan1st.getFullYear() + 1);

  function ageAt(birthDate) {
    return Math.abs(
      new Date(Jan1st.getTime() - birthDate.getTime()).getUTCFullYear() - 1970
    );
  }

  function ageGroupFor(janAge) {
    if (janAge < 6) {
      return 6;
    }
    return janAge + (janAge % 2);
  }
  function formatDate(d) {
    return d.toISOString().split("T")[0];
  }
  function ago(years) {
    const t = new Date(Jan1st.getTime());
    t.setFullYear(t.getFullYear() - years);
    return t;
  }
  class AgeGroup extends HTMLElement {
    static get observedAttributes() {
      return ["min", "max"];
    }

    // connect component
    get minAge() {
      return this.hasAttribute("min") ? Number(this.getAttribute("min")) : 4;
    }
    set minAge(val) {
      if (val) {
        this.setAttribute("min", val);
      } else {
        this.removeAttribute("min");
      }
    }
    get maxAge() {
      return this.hasAttribute("max") ? Number(this.getAttribute("max")) : 15;
    }

    set maxAge(val) {
      if (val) {
        this.setAttribute("max", val);
      } else {
        this.removeAttribute("max");
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
    }

    connectedCallback() {
      const shadow = this.attachShadow({ mode: "closed" });
      shadow.innerHTML = `
    <style>
      p {
        font-weight: normal;
        padding: 1em;
       }
    </style>

    <input type="date" min="${formatDate(ago(this.maxAge))}" max="${formatDate(
        ago(this.minAge)
      )}"/>
    <p></p>
    `;
      shadow.querySelector("input").addEventListener("input", (e) => {
        if (!e.target.value) {
          return;
        }
        const janAge = ageAt(new Date(e.target.value));
        const p = shadow.querySelector("p");
        if (janAge < 4) {
          p.innerHTML = "Sorry must be 4 by Jan 1, " + Jan1st.getFullYear();
        } else if (janAge > 14) {
          p.innerHTML = "Sorry must under 14 by Jan 1, " + Jan1st.getFullYear();
        } else {
          p.innerHTML = ageGroupFor(janAge) + "U";
        }
      });
    }
  }
  window.customElements.define("age-group", AgeGroup);
  console.log("loaded");
})();

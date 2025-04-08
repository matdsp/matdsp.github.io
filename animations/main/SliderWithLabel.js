class SliderWithLabel {
    constructor(name, min, max, value, direction, step) {
        this.my_element = document.createElement("div")
        this.my_element.className = "test"

        if (name)
        {
            // label
            var label = document.createElement("span")
            label.style = "font-size:30px;"
            label.append(name)
            this.my_element.appendChild(label)
        }

        // slider
        this.my_slider = document.createElement("input")
        this.my_slider.type = "range"
        this.my_slider.className = "slider"
        this.my_slider.min = min
        this.my_slider.max = max
        this.my_slider.value = value
        this.my_slider.step = step
        // this.my_slider.id = name + "_slider"


        if (direction == "vertical")
        {
            this.my_slider.style = "writing-mode:tb;direction:rtl;height:100px;"
        }
        else
        {
            this.my_slider.style = "width: 80%;"
        }

        this.my_element.appendChild(this.my_slider)

        // value label
        var span_label = document.createElement("span")
        // span_label.id = name + "_label"
        span_label.style = "display:inline-flex;width:20px;font-size:30px;"
        this.my_element.appendChild(span_label)

        // update the label
        this.my_slider.addEventListener("input", function () {
            span_label.textContent = Number(this.value).toFixed(Math.log10(1 / step))
        })

        // display initial value
        span_label.textContent = Number(this.value).toFixed(Math.log10(1 / step))
    }

    get element() {
        return this.my_element;
    }

    get slider() {
        return this.my_slider;
    }

    get value() {
        return this.slider.value;
    }
}
function linspace(start, stop, num, endpoint = true) {
	const div = endpoint ? (num - 1) : num;
	const step = (stop - start) / div;
	return Array.from({ length: num }, (_, i) => start + step * i);
}

// class SliderWithLabel {
// 	constructor(name, min, max, value, direction, step) {
// 		this.my_element = document.createElement("div")
// 		this.my_element.className = "test"
// 		//this.my_element.style="display:inline-grid;"
// 		// this.my_element.style = "width: 80%;"

// 		if (name)
// 		{
// 			// label
// 			var label = document.createElement("span")
// 			label.append(name)
// 			this.my_element.appendChild(label)
// 		}

// 		// slider
// 		this.my_slider = document.createElement("input")
// 		this.my_slider.type = "range"
// 		this.my_slider.className = "slider"
// 		this.my_slider.value = value
// 		this.my_slider.min = min
// 		this.my_slider.max = max
// 		this.my_slider.step = step
// 		this.my_slider.id = name + "_slider"


// 		if (direction == "vertical")
// 		{
// 			this.my_slider.style = "writing-mode:tb;direction:rtl;height:100px;"
// 		}
// 		else
// 		{
// 			this.my_slider.style = "width: 80%;"
// 		}

// 		this.my_element.appendChild(this.my_slider)

// 		// value label
// 		var span_label = document.createElement("span")
// 		span_label.id = name + "_label"
// 		span_label.style = "display:inline-flex;width:20px"
// 		this.my_element.appendChild(span_label)

// 		// update the label
// 		this.my_slider.addEventListener("input", function () {
// 			span_label.textContent = Number(this.value).toFixed(Math.log10(1 / step))
// 		})

// 		// display initial value
// 		span_label.textContent = Number(this.value).toFixed(Math.log10(1 / step))
// 	}

// 	get element() {
// 		return this.my_element;
// 	}

// 	get slider() {
// 		return this.my_slider;
// 	}

// 	get value() {
// 		return this.slider.value;
// 	}
// }

class WeightPlot {
	constructor(M, data) {
		this.my_element = document.createElement("div")
		this.my_element.style = "float:left;"

		// label
		// var label = document.createElement("span")
		// label.append(name)
		// this.my_element.appendChild(label)



		var polarLayout = {
			autosize: true,
			width: 100,
			height: 100,
			margin: {
				autoexpand: false,
				t: 0,
				b: 0,
				l: 0,
				r: 0,
			},
			paper_bgcolor: null,
			grid: {
				rows: 1,
				columns: M,
				pattern: "independent"
			},
			showlegend: false,
			polar: {

				domain: {
					x: [0, 1],
					y: [0, 1]
				},
				radialaxis: {
					visible: true,
					range: [0, 1],
					showticklabels: false,
					showgrid: false,
					showline: false,
					ticks: "",
				},
				angularaxis: {
					showticklabels: false,
					showgrid: false
				},
			}
		}

		var subplot_width = 1 / M

		this.my_plots = []
		this.my_sliders = []

		for (var microphone_index = 0; microphone_index < M; ++microphone_index)
		{
			var cur_trace = {
				type: "scatterpolar",
				mode: "lines",
				r: [0, 1],
				theta: [0, 0],
				fill: "toself",
				line: {
					color: "red"
				}
			}

			data.polarData.push([{ ...cur_trace }])

			// container of slider and plot
			var weightControl = document.createElement("div")
			weightControl.style = "float:left; display: inline-flex;width:120px;margin-left:20px"

			// label
			var slider = new SliderWithLabel("", 0, 1, 1, "vertical", 0.01)
			//slider.slider.style = slider.slider.style + ""//"height:100px;"
			this.my_sliders.push(slider.slider)
			weightControl.appendChild(slider.element)

			var plotContainer = document.createElement("div")
			plotContainer.id = "weightControl" + microphone_index
			plotContainer.style = "width:120px;height:120px;"
			weightControl.appendChild(plotContainer)

			

			this.my_element.appendChild(weightControl)

			var config = {
				displayModeBar: false
			}

			slider.slider.addEventListener("input", function (microphone_index, data, container, target) {
				// console.log(microphone_index, data)//this.value, data, microphone_index)
				data.polarData[microphone_index][0].r[1] = Number(target.target.value)
				Plotly.redraw(container)
			}.bind(null, microphone_index, data, plotContainer))

			Plotly.newPlot(plotContainer, data.polarData[microphone_index], polarLayout, config)

			this.my_plots.push(plotContainer)
		}
	}

	refresh() {
		for (var plot of this.plots)
		{
			Plotly.redraw(plot)
		}
	}

	get plots() {
		return this.my_plots;
	}

	get element() {
		return this.my_element;
	}

	get slider() {
		return this.my_slider;
	}

	get sliders() {
		return this.my_sliders;
	}

	get value() {
		return this.slider.value;
	}
}

function reset()
{

}


function weights_app() {
	const d = .2 // microphone distance
	const M = 4 // number of microphones
	const f = 1000 // signal frequency
	const c = 344

	const angle_degrees_min = -90
	const angle_degrees_max = 90
	const theta = linspace(angle_degrees_min / 180 * Math.PI, angle_degrees_max / 180 * Math.PI, 1000)

	const theta_degrees = Array.from(theta, (v, k) => 180 * v / Math.PI)

	var cur_weights = Array(M).fill(1)

	// beam pattern plot
	var line = {
		x: theta_degrees,
		y: calculate_beam_pattern(d, M, f, c, theta, 0, cur_weights)[0],//Array.from({length: theta.length}, (v,k) => k +1),
		type: "scatter"
	}

	var data = [line]

	var layout = {
		autosize: true,
		width: 900,
		height: 500,
		margin: {
			l: 50,
			r: 0,
			b: 40,
			t: 0,
			pad: 0
		},
		paper_bgcolor: "white",
		plot_bgcolor: "white",
		xaxis: {
			dtick: 20,
			range: [-90, 90],
			title: {
				text: "Einfallsrichtung (in &deg;)",
				font: {
					size: 14
				}
			}
		},
		yaxis: {
			dtick: 5,
			range: [-50, 5],
			title: {
				text: "Verst&#228;rkung (in dB)",
				font: {
					size: 14
				}
			}
		}
	};

	var config = {
		displayModeBar: false
	}

	Plotly.newPlot("rectPlot", data, layout, config)

	var cur_pattern_and_weights = []
	var cur_direction = 0
	var myData = {
		polarData: []
	}

	var phasePlot = new WeightPlot(M, myData)

	// weights
	for (idx_slider in phasePlot.sliders)
	{
		let callback = function (index, target) {
			cur_weights[index] = Number(target.target.value);

			cur_pattern_and_weights = calculate_beam_pattern(d, M, f, c, theta, cur_direction, cur_weights)
			data[0]["y"] = cur_pattern_and_weights[0]
			Plotly.redraw("rectPlot")
		}

		phasePlot.sliders[idx_slider].addEventListener("input", callback.bind(null, idx_slider))
	}

	// controls
	var slider_parent = document.getElementById("sliders")
	const sliderDirection = new SliderWithLabel("", -90, 90, 0, "horizontal", 1)
	slider_parent.append(sliderDirection.element)
	sliderDirection.slider.addEventListener("input", function () {
		cur_direction = this.value
		cur_pattern_and_weights = calculate_beam_pattern(d, M, f, c, theta, cur_direction, cur_weights)
		data[0]["y"] = cur_pattern_and_weights[0]

		for (var microphone_index = 0; microphone_index < M; ++microphone_index)
		{
			myData.polarData[microphone_index][0].theta = [cur_pattern_and_weights[1][microphone_index][0], cur_pattern_and_weights[1][microphone_index][0]]
		}

		Plotly.redraw("rectPlot")
		phasePlot.refresh()
	})

	slider_parent.appendChild(phasePlot.element)
}
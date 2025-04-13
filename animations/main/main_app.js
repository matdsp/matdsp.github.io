

function rotatePoint(x, y, theta) {
    return {
        x: x * Math.cos(-theta) - y * Math.sin(-theta),
        y: x * Math.sin(-theta) + y * Math.cos(-theta)
    };
}

function rotateArrays(array_1, array_2, theta) {
    return array_1.map(function (element, index) {
        const rotatedPoint = rotatePoint(element, array_2[index], theta)

        return {
            x: rotatedPoint.x,
            y: rotatedPoint.y
        }
    })
}

function linspace(start, stop, num, endpoint = true) {
    const div = endpoint ? (num - 1) : num;
    const step = (stop - start) / div;
    return Array.from({ length: num }, (_, i) => start + step * i);
}

function sine_vec(vec_t, f, phi) {
    return Array.from(vec_t, (t) => Math.sin(2 * Math.PI * f * t - phi))
}

function array_add_scalar(array, scalar) {
    return array.map((element) => element + scalar)
}

function array_multiply_scalar(array, scalar) {
    return array.map((element) => element * scalar)
}

function add_two_arrays(array_1, array_2) {
    return array_1.map((element, index) => element + array_2[index])
}

function create_microphone_shape_data(x, y, radius) {
    let shapes = [
        {
            // circle
            type: 'circle',
            xref: "x",
            yref: "y",
            x0: x - radius,
            y0: y - radius,
            x1: x + radius,
            y1: y + radius,
            line:
            {
                width: 4
            }
        },
        {
            // line
            type: 'line',
            x0: x - radius,
            y0: y - 1.2 * radius,
            x1: x - radius,
            y1: y + 1.2 * radius,
            line:
                { width: 4 }
        }
    ]

    return shapes
}

function create_weight_multiplier_shape_data(x, y, radius, microphone_index) {
    let traces = [
        {
            mode: "text",
            text: ["$w_" + microphone_index + "$"],
            x: [x],
            y: [y + 1.8],
            textfont:
            {
                size: 26
            }
        }
    ]

    let shapes = [
        {
            // circle
            type: 'circle',
            xref: "x",
            yref: "y",
            x0: x - radius,
            y0: y - radius,
            x1: x + radius,
            y1: y + radius,
        },
        {
            // line
            type: 'line',
            x0: x - 1 / Math.sqrt(2) * radius,
            y0: y - 1 / Math.sqrt(2) * radius,
            x1: x + 1 / Math.sqrt(2) * radius,
            y1: y + 1 / Math.sqrt(2) * radius
        },
        {
            // line
            type: 'line',
            x0: x - 1 / Math.sqrt(2) * radius,
            y0: y + 1 / Math.sqrt(2) * radius,
            x1: x + 1 / Math.sqrt(2) * radius,
            y1: y - 1 / Math.sqrt(2) * radius
        },
        {
            // line
            type: 'line',
            x0: x - 0.5,
            y0: y,
            x1: x - radius,
            y1: y
        }
    ]

    let annotations = {
        x: x,
        y: y + radius,
        ax: x,
        ay: y + 1.5,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        xref: "x",
        yref: "y",
        axref: "x",
        ayref: "y",
        text: "",
        arrowwidth: 2,
        arrowcolor: "black"
    }

    return { traces: traces, shapes: shapes, annotations: [annotations] }
}

function create_delay_shape_data(x, y, path_index) {

    const size = 1
    let traces = [
        {
            mode: "text",
            text: ["-D"],
            x: [x],
            y: [y - 0.05],
            textfont:
            {
                size: 26,
            }
        }
    ]

    let shapes = [
        {
            // rect
            type: 'rect',
            xref: "x",
            yref: "y",
            x0: x - size / 2,
            y0: y - size / 2,
            x1: x + size / 2,
            y1: y + size / 2,
            line:
            {
                width: 4
            }
        },
    ]

    if (path_index == 0)
    {
        traces[0].textfont.color = "grey"
        shapes[0].line.color = "grey"
    }

    return { traces: traces, shapes: shapes }
}

class MicrophonePath {
    constructor(vec_t, signal, delayed_signal, x, y, stretch_factor, parameters, path_index) {
        const radius = 0.5

        this.y = y

        let multiplier_x_offset = 0
        if (parameters && "show_weights" in parameters && parameters.show_weights)
        {
            multiplier_x_offset = 0.75
        }

        var traces = [
            {
                type: "scatter",
                x: array_add_scalar(array_multiply_scalar(vec_t, stretch_factor), x + radius + multiplier_x_offset),
                y: array_add_scalar(signal, y),
                line:
                {
                    color: "rgb(55, 128, 191)"
                }
            }
        ]

        let shapes_microphone = create_microphone_shape_data(x, y, radius)
        let shapes_weight_multiplier = create_weight_multiplier_shape_data(x + 1, y, radius / 2, path_index)
        let shapes_delay = create_delay_shape_data(x + 4.75, y, path_index)

        if (parameters && "show_weights" in parameters && !parameters.show_weights)
        {
            shapes_weight_multiplier.traces = []
            shapes_weight_multiplier.shapes = []
            shapes_weight_multiplier.annotations = []

        }

        if (parameters && "show_delays" in parameters && !parameters.show_delays)
        {
            shapes_delay.traces = []
            shapes_delay.shapes = []
        }
        else
        {
            traces = [
                ...traces,
                {
                    type: "scatter",
                    x: array_add_scalar(array_multiply_scalar(vec_t, stretch_factor), x + radius + multiplier_x_offset + 4),
                    y: array_add_scalar(delayed_signal, y),
                    line:
                    {
                        color: "rgb(200, 128, 191)"
                    }
                }
            ]
        }

        this.my_traces = [
            ...traces,
            ...shapes_weight_multiplier.traces,
            ...shapes_delay.traces
        ]

        this.my_shapes = [
            ...shapes_microphone,
            ...shapes_weight_multiplier.shapes,
            ...shapes_delay.shapes
        ]

        this.my_annotations = [
            ...shapes_weight_multiplier.annotations
        ]
    }

    get traces() {
        return this.my_traces
    }

    get shapes() {
        return this.my_shapes
    }

    get annotations() {
        return this.my_annotations
    }

    set_signal(signal) {
        this.my_traces[0].y = array_add_scalar(signal, this.y)
    }

    set_delayed_signal(signal) {
        this.my_traces[1].y = array_add_scalar(signal, this.y)
    }
}

function create_adder_block_data(x, y) {
    let trace = {
        x: [x],
        y: [y],
        mode: "text",
        text: ["+"],
        textfont:
        {
            size: 26,
            weight: "bold"
        }
    }

    const width = 1
    const height = 5

    let shapes = [
        {
            // rectangle
            type: 'rect',
            x0: x - width / 2,
            y0: y - height / 2,
            x1: x + width / 2,
            y1: y + height / 2,
            line:
            {
                width: 4
            }
        }
    ]

    return { traces: [trace], shapes: shapes }
}

class OutputSignal {
    constructor(vec_t, output_signal, x, y, stretch_factor) {
        this.y = y

        let trace = {
            x: array_add_scalar(array_multiply_scalar(vec_t, stretch_factor), x),
            y: array_add_scalar(output_signal, y),
            type: "scatter",
            line:
            {
                color: "red"
            }
        }

        this.my_traces = [trace]
    }

    get traces() {
        return this.my_traces
    }

    set_signal(signal) {
        this.my_traces[0].y = array_add_scalar(signal, this.y)
    }
}

function compute_signals(vec_t, f, tau_propagation, tau_steering, parameters) {
    const phi_propagation = 2 * Math.PI * f * tau_propagation
    const phi_steering = 2 * Math.PI * f * tau_steering

    // microphone signals
    let microphone_1_signal = sine_vec(vec_t, f, 0)
    let microphone_2_signal = sine_vec(vec_t, f, phi_propagation)

    // delayed signals
    const phi = phi_propagation - phi_steering
    let delayed_signal_1 = microphone_1_signal
    let delayed_signal_2 = sine_vec(vec_t, f, phi)

    if (parameters && "show_weights" in parameters && parameters.show_weights)
    {
        microphone_1_signal = array_multiply_scalar(microphone_1_signal, 0.5)
        microphone_2_signal = array_multiply_scalar(microphone_2_signal, 0.5)
        delayed_signal_1 = array_multiply_scalar(delayed_signal_1, 0.5)
        delayed_signal_2 = array_multiply_scalar(delayed_signal_2, 0.5)
    }

    const sum_signal = add_two_arrays(delayed_signal_1, delayed_signal_2)

    return {
        microphone_1: microphone_1_signal,
        microphone_2: microphone_2_signal,
        delayed_1: delayed_signal_1,
        delayed_2: delayed_signal_2,
        sum: sum_signal
    }
}

class SteeringVector {
    constructor(x, y, theta) {
        this.x = x
        this.y = y

        this.length = 4

        const target_x = this.x - this.length * Math.cos(theta)
        const target_y = this.y + this.length * Math.sin(theta)
        let annotations = {
            x: target_x,
            y: target_y,
            ax: x,
            ay: y,
            showarrow: true,
            arrowhead: 2,
            arrowsize: 1,
            xref: "x",
            yref: "y",
            axref: "x",
            ayref: "y",
            text: "",
            arrowwidth: 2,
            arrowcolor: "blue"
        }

        this.my_annotations = [annotations]
    }

    get annotations() {
        return this.my_annotations
    }

    set_direction(theta) {
        const target_x = this.x - this.length * Math.cos(theta)
        const target_y = this.y + this.length * Math.sin(theta)
        this.my_annotations[0].x = target_x
        this.my_annotations[0].y = target_y
    }
}

class BeamformerPlot {
    constructor(vec_t, vec_t_incoming, stretch_factor, parameters) {
        this.f = 1000
        this.c = 344
        this.d = 0.2

        this.tau_propagation = 0
        this.tau_steering = 0

        this.parameters = parameters
        this.vec_t = vec_t

        const signals = compute_signals(vec_t, this.f, this.tau_propagation, this.tau_steering, parameters)

        this.incoming_wave = new IncomingWave(vec_t_incoming, this.f, 6, 2.5, 5, 0.5, stretch_factor)

        this.steering_vector = new SteeringVector(7.5, 2.5, this.tau_steering)

        this.microphone_path_1 = new MicrophonePath(vec_t, signals.microphone_1, signals.delayed_1, 8, 1, stretch_factor, parameters, 1)
        this.microphone_path_2 = new MicrophonePath(vec_t, signals.microphone_2, signals.delayed_2, 8, 4, stretch_factor, parameters, 0)

        let adder_offset = 4
        if (parameters && "show_delays" in parameters && parameters.show_delays)
        {
            adder_offset = 4
        }
        else
        {
            this.steering_vector.my_annotations = []
        }



        const adder_data = create_adder_block_data(5 + 7 + 0.75 + adder_offset, 2.5)

        this.output_signal = new OutputSignal(vec_t, signals.sum, 5.5 + 7 + 0.75 + adder_offset, 2.5, stretch_factor)

        let layout = {
            xaxis: {
                range: [2, 26],
                zeroline: false,
                scaleanchor: "y",
                scaleratio: 1,

                dtick: [],
                showgrid: false,
                showticklabels: false,
                showline: false,
                zeroline: false,
                ticks: ""
            },
            yaxis: {
                range: [0, 9],
                scaleratio: 1,

                dtick: [],
                showgrid: false,
                showticklabels: false,
                showline: false,
                zeroline: false,
                ticks: ""
            },
            width: 1200,
            height: 400,
            showlegend: false,
            margin: {
                autoexpand: true,
                t: 0,
                b: 50,
                l: 50,
                r: 0,
            },
            plot_bgcolor: "rgba(0, 0, 0, 0)",
            paper_bgcolor: "rgba(0, 0, 0, 0)",
            shapes: [
                ...this.incoming_wave.shapes,
                ...this.microphone_path_1.shapes,
                ...this.microphone_path_2.shapes,
                ...adder_data.shapes
            ],
            annotations: [
                ...this.incoming_wave.annotations,
                ...this.microphone_path_1.annotations,
                ...this.microphone_path_2.annotations,
                ...this.steering_vector.annotations
            ]
        }

        let data = [
            ...this.incoming_wave.traces,
            ...this.microphone_path_1.traces,
            ...this.microphone_path_2.traces,
            ...adder_data.traces,
            ...this.output_signal.traces
        ]

        var config = {
            displayModeBar: false
        }

        this.plot = Plotly.newPlot(parameters.target_main, data, layout, config)
    }

    set_propagation_direction(theta) {
        this.tau_propagation = this.d * Math.sin(theta) / this.c

        this.incoming_wave.set_direction(theta)

        const signals = compute_signals(this.vec_t, this.f, this.tau_propagation, this.tau_steering, this.parameters)
        this.microphone_path_1.set_signal(signals.microphone_2)

        if (this.parameters && "show_delays" in this.parameters && this.parameters.show_delays)
        {
            this.microphone_path_1.set_delayed_signal(signals.delayed_2)
        }
        this.output_signal.set_signal(signals.sum)
    }

    set_steering_direction(theta) {
        this.tau_steering = this.d * Math.sin(theta) / this.c

        const signals = compute_signals(this.vec_t, this.f, this.tau_propagation, this.tau_steering, this.parameters)
        this.microphone_path_1.set_delayed_signal(signals.delayed_2)
        this.output_signal.set_signal(signals.sum)

        this.steering_vector.set_direction(theta)
    }

    set_frequency(frequency) {
        this.f = frequency

        this.incoming_wave.set_frequency(frequency)

        const signals = compute_signals(this.vec_t, this.f, this.tau_propagation, this.tau_steering, this.parameters)
        this.microphone_path_1.set_signal(signals.microphone_2)
        this.microphone_path_2.set_signal(signals.microphone_1)

        if (this.parameters && "show_delays" in this.parameters && this.parameters.show_delays)
        {
            this.microphone_path_1.set_delayed_signal(signals.delayed_2)
            this.microphone_path_2.set_delayed_signal(signals.delayed_1)
        }
        this.output_signal.set_signal(signals.sum)
    }
}

class IncomingWave {
    constructor(vec_t, f, x, y, move_radius, circle_radius, stretch_factor) {
        this.signal = Array.from(vec_t, (t) => Math.sin(2 * Math.PI * f * t))
        this.vec_t_unstretched = vec_t
        this.vec_t = array_multiply_scalar(vec_t, stretch_factor)
        this.f = f
        this.theta = 0
        this.stretch_factor = stretch_factor

        this.x = x
        this.y = y
        this.move_radius = move_radius
        this.circle_radius = circle_radius

        const cur_x = x - move_radius
        const cur_y = y

        var line = {
            x: array_add_scalar(this.vec_t, x + circle_radius - move_radius),
            y: array_add_scalar(this.signal, y),
            type: "scatter",
            line:
            {
                color: "lightgreen"
            }
        }

        var shapes = [
            {
                // circle
                type: 'circle',
                xref: "x",
                yref: "y",
                x0: cur_x - circle_radius,
                y0: cur_y - circle_radius,
                x1: cur_x + circle_radius,
                y1: cur_y + circle_radius,
                fillcolor: "green",
                line:
                {
                    color: "green"
                }
            }
        ]

        var annotations = {

            x: x,
            y: y,
            ax: cur_x + circle_radius,
            ay: cur_y,
            showarrow: true,
            arrowhead: 2,
            arrowsize: 1,
            xref: "x",
            yref: "y",
            axref: "x",
            ayref: "y",
            text: "",
            arrowwidth: 2,
            arrowcolor: "green"
        }

        this.my_traces = [line]
        this.my_shapes = shapes
        this.my_annotations = [annotations]
    }

    get traces() {
        return this.my_traces
    }

    get shapes() {
        return this.my_shapes
    }

    get annotations() {
        return this.my_annotations
    }

    set_direction(theta) {
        this.theta = theta
        const cur_x = this.x - this.move_radius * Math.cos(theta)
        const cur_y = this.y + this.move_radius * Math.sin(theta)

        this.my_shapes[0].x0 = cur_x - this.circle_radius
        this.my_shapes[0].y0 = cur_y - this.circle_radius
        this.my_shapes[0].x1 = cur_x + this.circle_radius
        this.my_shapes[0].y1 = cur_y + this.circle_radius

        const rotatedSine = rotateArrays(this.vec_t, this.signal, theta)

        const rotated_vec_t = Array.from(rotatedSine, (element) => element.x)
        const rotated_signal = Array.from(rotatedSine, (element) => element.y)

        this.my_traces[0].x = array_add_scalar(rotated_vec_t, cur_x + this.circle_radius * Math.cos(theta))
        this.my_traces[0].y = array_add_scalar(rotated_signal, cur_y - this.circle_radius * Math.sin(theta))//- this.circle_radius * 1)

        this.my_annotations[0].ax = cur_x + this.circle_radius * Math.cos(theta)
        this.my_annotations[0].ay = cur_y - this.circle_radius * Math.sin(theta)
    }

    set_frequency(frequency) {
        this.f = frequency

        this.signal = Array.from(this.vec_t_unstretched, (t) => Math.sin(2 * Math.PI * this.f * t))
        this.set_direction(this.theta)

    }
}

class MainApp {
    constructor(parameters) {
        const stretch_factor = 2000

        // incoming wave
        const T_incoming = 4 / stretch_factor
        const N_t_incoming = 1000

        // sines in beamformer
        let T_beamformer = 3

        if (parameters && "show_weights" in parameters && !parameters.show_weights)
        {
            // make the internal signal a bit longer
            T_beamformer += 0.75
        }
        if (parameters && "show_delays" in parameters && !parameters.show_delays)
        {
            // make the internal signal a bit longer
            T_beamformer += 4
        }

        T_beamformer /= stretch_factor

        const N_t_beamformer = 1000

        // incoming wave
        const vec_t_incoming = linspace(0, T_incoming, N_t_incoming)

        // rest
        const vec_t_beamformer = linspace(0, T_beamformer, N_t_beamformer)
        let beamformer_plot = new BeamformerPlot(vec_t_beamformer, vec_t_incoming, stretch_factor, parameters)

        // add controls
        var slider_parent = document.getElementById(parameters.target_controls)

        // direction
        const propagation_direction = new SliderWithLabel("Propagation-Richtung", 0, 120, 0, "horizontal", 1)
        slider_parent.append(propagation_direction.element)
        propagation_direction.slider.addEventListener("input", function () {
            const theta = Number(this.value) / 180 * Math.PI
            beamformer_plot.set_propagation_direction(theta)
            Plotly.redraw(parameters.target_main)
        })

        if (parameters && "show_delays" in parameters && parameters.show_delays)
        {
            const steering_direction = new SliderWithLabel("Steering-Richtung", 0, 90, 0, "horizontal", 1)
            slider_parent.append(steering_direction.element)
            steering_direction.slider.addEventListener("input", function () {
                const theta = Number(this.value) / 180 * Math.PI
                beamformer_plot.set_steering_direction(theta)
                Plotly.redraw(parameters.target_main)
            })
        }

        if (parameters && "show_frequency" in parameters && parameters.show_frequency)
        {
            const frequency = new SliderWithLabel("Frequenz", 0, 5000, 1000, "horizontal", 1)
            slider_parent.append(frequency.element)
            frequency.slider.addEventListener("input", function () {
                const frequency = Number(this.value)
                beamformer_plot.set_frequency(frequency)
                Plotly.redraw(parameters.target_main)
            })
        }
    }
}
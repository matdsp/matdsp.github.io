function calculate_beam_pattern(d, M, f, c, theta, direction, weights) {
	var beamPattern = []
	var steeringVector = []

	const omega = 2 * Math.PI * f

	const tau_direction = d * Math.sin(direction / 180 * Math.PI) / c

	// first compute the steering vector (angle and weight)
	for (let microphone_index = 0; microphone_index < M; ++microphone_index)
	{
		var steering_element = [microphone_index * omega * (tau_direction) / Math.PI * 180]

		steeringVector.push(steering_element)
	}

	for (cur_theta of theta)
	{
		tau = d * Math.sin(cur_theta) / c

		let realSum = 0
		let imagSum = 0

		for (let microphone_index = 0; microphone_index < M; ++microphone_index)
		{
			realSum += weights[microphone_index] * Math.cos(microphone_index * omega * (tau - tau_direction))
			imagSum += weights[microphone_index] * Math.sin(microphone_index * omega * (tau - tau_direction))
		}

		const cur_gain = Math.sqrt(realSum * realSum + imagSum * imagSum) / M
		const cur_gain_db = 20 * Math.log10(cur_gain)

		beamPattern.push(cur_gain_db)
	}

	return [beamPattern, steeringVector]
}
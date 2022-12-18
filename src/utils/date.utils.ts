export const compareTime = (time1: Date, time2: Date): boolean => {
	const t1 = new Date(time1);
	const t2 = new Date(time2);

	//check if date is in the past
	if (t1.getTime() < new Date().getTime()) {
		throw new Error("Start time must be in the future");
	}
	//check in date is in weekday
	if (t1.getDay() === 0 || t1.getDay() === 6) {
		throw new Error("Day must be a weekday");
	}

	if (
		t1.getMonth() !== t2.getMonth() ||
		t1.getFullYear() !== t2.getFullYear() ||
		t1.getDate() !== t2.getDate()
	) {
		throw new Error("Start time and end time must be in the same day");
	}

	if (t2.getTime() - t1.getTime() !== 3600000) {
		throw new Error("Start time and end time must be one hour apart");
	}

	if (t1.getHours() < 8 || t1.getHours() > 19) {
		throw new Error("Start time must be between 08:00 and 19:00");
	}
	if (t2.getHours() < 9 || t2.getHours() > 20) {
		throw new Error("End time must be between 09:00 and 20:00");
	}

	if (t1.getTime() >= t2.getTime()) {
		throw new Error("Start time must be before end time");
	}

	return true;
};

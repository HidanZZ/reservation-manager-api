export const meetingType: { [key: string]: { [key: string]: boolean } } = {
	VC: { screen: true, webcam: true, pieuvre: true },
	SPEC: { webcam: true },
	RS: {},
	RC: { screen: true, whiteboard: true, pieuvre: true },
};

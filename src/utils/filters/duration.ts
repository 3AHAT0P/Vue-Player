export default (value: number, type: string, format: string) => {
  const time: any = {
    h: 0,
    m: 0,
    s: 0,
    ms: 0,
  };
  switch (type) {
    case 'h': {
      time.h = value;
      break;
    }
    case 'm': {
      time.h = Math.trunc(value / 60);
      time.m = value - time.h * 60;
      break;
    }
    case 's': {
      time.h = Math.trunc(value / 60 / 60);
      time.m = Math.trunc(value / 60 - time.h * 60);
      time.s = value - time.h * 60 * 60 - time.m * 60;
      break;
    }
    default: {
      time.h = Math.trunc(value / 60 / 60 / 1000);
      time.m = Math.trunc((value / 60 / 1000 - time.h * 60));
      time.s = value / 1000 - time.h * 60 * 60 - time.m * 60;
      time.ms = value % 1000;
    }
  }
  switch (format) {
    case 'HH:MM:SS': {
      // tslint:disable-next-line
      return `${time.h > 0 ? time.h.toString().padStart(2, '0') : '00'}:${time.m > 0 ? time.m.toString().padStart(2, '0') : '00'}:${time.s > 0 ? time.s.toString().padStart(2, '0') : '00'}`;
    }
    case 'MM:SS': {
      // tslint:disable-next-line
      return `${time.m > 0 ? time.m.toString().padStart(2, '0') : '00'}:${time.s > 0 ? time.s.toString().padStart(2, '0') : '00'}`;
    }
    case 'SS': {
      // tslint:disable-next-line
      return `${time.s > 0 ? time.s.toString().padStart(2, '0') : '00'}`;
    }
  }
};

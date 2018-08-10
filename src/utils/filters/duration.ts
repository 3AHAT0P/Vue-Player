export default (value: number, type: string, format: string) => {
  const time: any = {
    h: 0,
    m: 0,
    s: 0,
    ms: 0,
  };
  switch (type) {
    case 'h': {
      time.d = Math.trunc(value / 24);
      time.h = value - time.d * 24;
      break;
    }
    case 'm': {
      time.d = Math.trunc(value / 60 / 24);
      time.h = Math.trunc(value / 60 - time.d * 24);
      time.m = value - time.d * 24 * 60 - time.h * 60;
      break;
    }
    case 's': {
      time.d = Math.trunc(value / 60 / 60 / 24);
      time.h = Math.trunc(value / 60 / 60 - time.d * 24);
      time.m = Math.trunc(value / 60 - time.d * 24 * 60 - time.h * 60);
      time.s = value - time.d * 24 * 60 * 60 - time.h * 60 * 60 - time.m * 60;
      break;
    }
    default: {
      time.d = Math.trunc(value / 1000 / 60 / 60 / 24);
      time.h = Math.trunc(value / 1000 / 60 / 60 - time.d * 24);
      time.m = Math.trunc(value / 1000 / 60 - time.d * 24 * 60 - time.h * 60);
      time.s = Math.trunc(value / 1000 - time.d * 24 * 60 * 60 - time.h * 60 * 60 - time.m * 60);
      time.ms = value % 1000;
    }
  }
  switch (format) {
    case 'DD:HH:MM:SS': {
      // tslint:disable-next-line
      return `${time.d > 0 ? time.d.toString().padStart(2, '0') : '00'}:${time.h > 0 ? time.h.toString().padStart(2, '0') : '00'}:${time.m > 0 ? time.m.toString().padStart(2, '0') : '00'}:${time.s > 0 ? time.s.toString().padStart(2, '0') : '00'}`;
    }
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

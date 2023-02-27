class TimeFormatter {
  private static timezone = new Date().getTimezoneOffset();
  private static gmt = 3600000 * (this.timezone / 60 + 9);
  private static week = ["월", "화", "수", "목", "금", "토", "일"];

  public static getTime(time?: number | Date | string ) {
    const source = !time ? new Date().getTime() : typeof time === 'number' ? time : new Date(time).getDate();
    const date = new Date(source + this.gmt);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const today = new Date(`${year}-${month + 1}-${day}`).getDay();
    const weekLabel = this.week[today ? today - 1 : 6];
    const minute = date.getMinutes();
    const seconds = date.getSeconds();
    const tfHour = date.getHours();
    const hour = tfHour >= 13 ? tfHour - 12 : tfHour;
    const division = tfHour >= 12 ? "오후" : "오전";

    return `${year}년 ${month + 1}월 ${day}일(${weekLabel}) ${division} ${hour}시 ${minute}분 ${seconds}초`;
  }
}

export default TimeFormatter;
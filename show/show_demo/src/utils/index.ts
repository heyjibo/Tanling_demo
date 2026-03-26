/**
 * 将时间转换成最近一分钟的时间范围字符串
 * @param time - 输入的时间，可以是 Date、string 或 number(时间戳)
 * @returns 格式为 "startTime=YYYY-MM-DDTHH:mm&endTime=YYYY-MM-DDTHH:mm" 的字符串
 */
export function parseHZYTime(time?: Date | string | number): string {
  let date: Date;
  
  // 如果没有传入参数，使用当前时间
  if (time === undefined) {
    date = new Date();
  } else if (time instanceof Date) {
    date = time;
  } else if (typeof time === 'string') {
    date = new Date(time);
  } else if (typeof time === 'number') {
    date = new Date(time);
  } else {
    throw new Error('Invalid time parameter');
  }
  
  // 验证日期是否有效
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  
  // 格式化时间为 YYYY-MM-DDTHH:mm
  const formatTime = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  // 计算开始时间（当前时间）
  const endTime = formatTime(date);
  
  // 计算结束时间（当前时间 + 1 分钟）
  const startDate = new Date(date.getTime() - 60 * 1000);
  const startTime = formatTime(startDate);
  
  return `startTime=${startTime}&endTime=${endTime}`;
}

export function changeTemperatureObject(item: any) {
  return {
    ...item,
    temperature1: {value: item.temperature1},
    temperature2: {value: item.temperature2},
    temperature3: {value: item.temperature3},
    temperature4: {value: item.temperature4},
    temperature5: {value: item.temperature5},
    temperature6: {value: item.temperature6},
    temperature7: {value: item.temperature7},
    temperature8: {value: item.temperature8},
    temperature9: {value: item.temperature9},
    temperature10: {value: item.temperature10},
    temperature11: {value: item.temperature11},
    temperature12: {value: item.temperature12},
    temperature13: {value: item.temperature13},
    temperature14: {value: item.temperature14},
    temperature15: {value: item.temperature15},
    temperature16: {value: item.temperature16}
  }
}
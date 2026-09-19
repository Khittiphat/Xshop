/**
 * Smart Heuristic Pricing Service for On-Demand Items
 */

export function calculateSmartPrice(keyword) {
  if (!keyword || typeof keyword !== 'string') return 35.00;
  const kw = keyword.toLowerCase().trim();

  // 1. Luxury / Vehicles / Electronics / High-ticket items
  // keywords like "เรือ", "รถ", "ทีวี", "ทอง", "iphone", "submarine", "car"
  if (/เรือดำน้ำ|submarine/i.test(kw)) {
    return 15000000000.00; // 15 Billion THB
  }
  if (/เครื่องบิน|airplane|jet|helicopter/i.test(kw)) {
    return 25000000.00;
  }
  if (/เรือ|boat|yacht/i.test(kw)) {
    return 1500000.00;
  }
  if (/รถยนต์|รถเก๋ง|รถกระบะ|รถตู้|car|automobile|truck|tesla/i.test(kw)) {
    return 850000.00;
  }
  if (/รถ|มอเตอร์ไซค์|มอไซค์|motorcycle|bike/i.test(kw)) {
    return 65000.00;
  }
  if (/ทอง|ทองคำ|gold|เพชร|diamond/i.test(kw)) {
    return 45000.00;
  }
  if (/iphone|ไอโฟน|macbook|ipad|laptop|โน้ตบุ๊ค|คอมพิวเตอร์|computer|playstation|ps5/i.test(kw)) {
    return 39900.00;
  }
  if (/ทีวี|โทรทัศน์|tv|television|ตู้เย็น|refrigerator|แอร์|air\s*conditioner/i.test(kw)) {
    return 14900.00;
  }

  // 2. Water / Basic drinks: ฿7 - ฿15
  if (/น้ำเปล่า|น้ำดื่ม|น้ำสิงห์|น้ำทิพย์|น้ำแร่|water|mineral/i.test(kw)) {
    return 10.00;
  }
  if (/น้ำแข็ง|ice/i.test(kw)) {
    return 8.00;
  }
  if (/โซดา|soda/i.test(kw)) {
    return 12.00;
  }
  if (/นม|เป๊ปซี่|โค้ก|coke|cola|pepsi|sprite|fanta|ชา|tea|กาแฟ|coffee|drink|juice/i.test(kw)) {
    return 15.00;
  }

  // 3. Instant foods, noodles, ready meals: ฿7 - ฿85
  if (/มาม่า|ไวไว|ยำยำ|บะหมี่|noodle|ramen/i.test(kw)) {
    return 7.00;
  }
  if (/ไข่|ไข่ไก่|ไข่ต้ม|egg/i.test(kw)) {
    return 16.00;
  }
  if (/ขนมปัง|bread|sandwich|ซาลาเปา|ไส้กรอก|sausage/i.test(kw)) {
    return 29.00;
  }
  if (/ข้าวกล่อง|ข้าวผัด|เบนโตะ|ready\s*meal|bento/i.test(kw)) {
    return 45.00;
  }
  if (/ข้าวสาร|ข้าวหอมมะลิ|rice/i.test(kw)) {
    return 65.00;
  }

  // 4. General snacks / groceries / personal care / household: ฿15 - ฿85
  if (/เลย์|มันฝรั่ง|chips|pringles|snack|cookie|oreo|chocolate|ช็อกโกแลต|ขนม/i.test(kw)) {
    return 30.00;
  }
  if (/สบู่|soap|ยาสีฟัน|toothpaste|แปรงสีฟัน|toothbrush|แชมพู|shampoo/i.test(kw)) {
    return 18.00;
  }
  if (/ผงซักฟอก|detergent|น้ำยาล้างจาน|ทิชชู่|tissue|wipe/i.test(kw)) {
    return 35.00;
  }

  // 5. Standard fallback: ฿25 - ฿60
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) {
    hash = keyword.charCodeAt(i) + ((hash << 5) - hash);
  }
  const fallback = 25 + (Math.abs(hash) % 36);
  return Number(fallback.toFixed(2));
}

export default calculateSmartPrice;

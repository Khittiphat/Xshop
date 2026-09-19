/**
 * Comprehensive Heuristic & Tier-Based Pricing Engine
 * Maps search queries into realistic price brackets:
 * 1. Mega Vehicles / Industrial / Marine / Aviation: ฿50M - ฿2.5B
 * 2. Real Estate / Buildings: ฿3.5M - ฿50M
 * 3. Vehicles: ฿80k - ฿25M
 * 4. Firearms / Tactical / Hunting: ฿25k - ฿180k
 * 5. High-End Tech / Computing / Gadgets: ฿12k - ฿150k
 * 6. Luxury / Precious Metals: ฿40k - ฿800k
 * 7. Home Appliances / Furniture: ฿3,000 - ฿45,000
 * 8. Everyday Groceries & Convenience: ฿10 - ฿150
 * 9. Universal Fallback: ฿100 - ฿1,000
 */

export function getKeywordHash(str) {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getBracketPrice(keyword, min, max, roundTo = 1) {
  const hash = getKeywordHash(keyword);
  const ratio = (hash % 1000) / 1000;
  let val = min + (max - min) * ratio;
  if (roundTo >= 1) {
    val = Math.round(val / roundTo) * roundTo;
  }
  return Number(val.toFixed(2));
}

export function calculateSmartPrice(keyword) {
  if (!keyword || typeof keyword !== 'string') return 35.00;
  const kw = keyword.toLowerCase().trim();

  // 1. Mega Vehicles / Industrial / Marine / Aviation (฿50,000,000 - ฿2,500,000,000)
  // Keywords: เรือดำน้ำ, submarine, เครื่องบิน, airplane, เรือยอชต์, yacht, รถถัง, tank, etc.
  if (/เรือดำน้ำ|submarine/i.test(kw)) {
    return 1500000000.00; // ฿1.5 Billion
  }
  if (/เครื่องบิน|airplane|jet|helicopter|เฮลิคอปเตอร์/i.test(kw)) {
    return 850000000.00; // ฿850 Million
  }
  if (/เรือยอชต์|เรือยอร์ช|yacht|เรือสำราญ|cruise/i.test(kw)) {
    return 250000000.00; // ฿250 Million
  }
  if (/รถถัง|tank|ยานเกราะ|armor\s*vehicle/i.test(kw)) {
    return 95000000.00; // ฿95 Million
  }
  if (/ยานอวกาศ|spaceship|rocket|กระสวยอวกาศ/i.test(kw)) {
    return 2200000000.00; // ฿2.2 Billion
  }
  if (/marine|aviation|industrial\s*plant|โรงงาน|เครื่องจักรกลหนัก/i.test(kw)) {
    return getBracketPrice(kw, 50000000, 2500000000, 1000000);
  }

  // 2. Real Estate / Buildings (฿3,500,000 - ฿50,000,000)
  // Keywords: บ้าน, house, คอนโด, condo, ที่ดิน, land, เกาะ, island, etc.
  if (/เกาะ|island|คฤหาสน์|mansion/i.test(kw)) {
    return 45000000.00; // ฿45 Million
  }
  if (/ตึก|building|วิลล่า|villa|โรงแรม|hotel/i.test(kw)) {
    return 28000000.00; // ฿28 Million
  }
  if (/บ้าน|house|บ้านเดี่ยว|townhome|ทาวน์โฮม/i.test(kw)) {
    return 8500000.00; // ฿8.5 Million
  }
  if (/คอนโด|condo|condominium|ที่ดิน|land|ห้องชุด|apartment/i.test(kw)) {
    return 3800000.00; // ฿3.8 Million
  }
  if (/real\s*estate|อสังหา/i.test(kw)) {
    return getBracketPrice(kw, 3500000, 50000000, 100000);
  }

  // 3. Firearms / Tactical / Hunting (฿25,000 - ฿180,000)
  // Keywords: ปืน, gun, rifle, pistol, มีดเดินป่า, etc.
  if (/sniper|สไนเปอร์|rifle|ปืนยาว/i.test(kw)) {
    return 125000.00;
  }
  if (/shotgun|ลูกซอง/i.test(kw)) {
    return 65000.00;
  }
  if (/pistol|revolver|ปืนพก|ปืนสั้น/i.test(kw)) {
    return 55000.00;
  }
  if (/ปืน|gun|firearm|อาวุธ|weapon/i.test(kw)) {
    return 45000.00;
  }
  if (/มีดเดินป่า|มีดพก|tactical\s*knife|hunting\s*knife|survival\s*knife/i.test(kw)) {
    return 28500.00;
  }
  if (/tactical|hunting\s*gear/i.test(kw)) {
    return getBracketPrice(kw, 25000, 180000, 500);
  }

  // 4. Luxury / Precious Metals (฿40,000 - ฿800,000)
  // Keywords: ทอง, gold, เพชร, diamond, rolex, นาฬิกาหรู, etc.
  if (/rolex|patek|นาฬิกาหรู|luxury\s*watch/i.test(kw)) {
    return 450000.00;
  }
  if (/เพชร|diamond|ruby|มรกต|emerald/i.test(kw)) {
    return 250000.00;
  }
  if (/hermes|chanel|louis\s*vuitton|แบรนด์เนม|brandname/i.test(kw)) {
    return 165000.00;
  }
  if (/ทอง|ทองคำ|gold|ทองแท่ง|รูปพรรณ/i.test(kw)) {
    return 45000.00;
  }
  if (/luxury|precious\s*metal|jewelry|อัญมณี/i.test(kw)) {
    return getBracketPrice(kw, 40000, 800000, 1000);
  }

  // 5. High-End Tech / Computing / Gadgets (฿12,000 - ฿150,000)
  // Keywords: คอม, computer, pc, laptop, การ์ดจอ, gpu, iphone, macbook, เซิร์ฟเวอร์, server, etc.
  if (/เซิร์ฟเวอร์|server|datacenter/i.test(kw)) {
    return 129000.00;
  }
  if (/macbook|mac\s*studio|imac|workstation/i.test(kw)) {
    return 69900.00;
  }
  if (/การ์ดจอ|gpu|rtx|geforce|graphic\s*card/i.test(kw)) {
    return 32900.00;
  }
  if (/iphone|ไอโฟน|ipad|ไอแพด|smartphone|มือถือ/i.test(kw)) {
    return 39900.00;
  }
  if (/คอม|คอมพิวเตอร์|computer|pc|laptop|โน้ตบุ๊ค|โน้ตบุ๊ก|gaming/i.test(kw)) {
    return 42500.00;
  }
  if (/playstation|ps5|xbox|nintendo/i.test(kw)) {
    return 18900.00;
  }
  if (/camera|กล้อง|drone|โดรน/i.test(kw)) {
    return getBracketPrice(kw, 12000, 150000, 100);
  }

  // 6. Vehicles (฿80,000 - ฿25,000,000)
  // Keywords: รถ, รถยนต์, car, supercar, มอเตอร์ไซค์, motorcycle, etc.
  if (/supercar|ferrari|lamborghini|porsche|ซูเปอร์คาร์/i.test(kw)) {
    return 18500000.00; // ฿18.5 Million
  }
  if (/bmw|mercedes|benz|audi|tesla|lexus|รถหรู/i.test(kw)) {
    return 3200000.00; // ฿3.2 Million
  }
  if (/รถยนต์|รถเก๋ง|รถกระบะ|รถตู้|car|automobile|truck|van/i.test(kw)) {
    return 850000.00;
  }
  if (/บิ๊กไบค์|bigbike|ducati|harley/i.test(kw)) {
    return 450000.00;
  }
  if (/รถ|มอเตอร์ไซค์|มอไซค์|motorcycle|scooter|bike/i.test(kw)) {
    return 850000.00;
  }
  if (/vehicle|automotive/i.test(kw)) {
    return getBracketPrice(kw, 80000, 25000000, 10000);
  }

  // 7. Home Appliances / Furniture (฿3,000 - ฿45,000)
  // Keywords: ตู้เย็น, fridge, ทีวี, tv, โซฟา, sofa, เตียง, bed, etc.
  if (/แอร์|air\s*conditioner|เครื่องปรับอากาศ|เครื่องซักผ้า|washing\s*machine/i.test(kw)) {
    return 21900.00;
  }
  if (/ตู้เย็น|fridge|refrigerator/i.test(kw)) {
    return 18500.00;
  }
  if (/ทีวี|โทรทัศน์|tv|television/i.test(kw)) {
    return 15900.00;
  }
  if (/โซฟา|sofa|เตียง|bed|ที่นอน|mattress/i.test(kw)) {
    return 12500.00;
  }
  if (/โต๊ะ|table|เก้าอี้|chair|ตู้เสื้อผ้า|wardrobe/i.test(kw)) {
    return 4500.00;
  }
  if (/furniture|appliance|เฟอร์นิเจอร์|เครื่องใช้ไฟฟ้า/i.test(kw)) {
    return getBracketPrice(kw, 3000, 45000, 100);
  }

  // 8. Everyday Groceries & Convenience items (฿10 - ฿150)
  // Water / basic drinks (฿7 - ฿15)
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

  // Instant foods, noodles, staples (฿7 - ฿65)
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

  // General snacks / personal care / toiletries / household items (฿15 - ฿85)
  if (/เลย์|มันฝรั่ง|chips|pringles|snack|cookie|oreo|chocolate|ช็อกโกแลต|ขนม/i.test(kw)) {
    return 30.00;
  }
  if (/สบู่|soap|ยาสีฟัน|toothpaste|แปรงสีฟัน|toothbrush|แชมพู|shampoo/i.test(kw)) {
    return 18.00;
  }
  if (/ผงซักฟอก|detergent|น้ำยาล้างจาน|ทิชชู่|tissue|wipe/i.test(kw)) {
    return 35.00;
  }
  if (/grocery|convenience|ของชำ|ของกิน/i.test(kw)) {
    return getBracketPrice(kw, 10, 150, 1);
  }

  // 9. Universal Fallback: (฿100 - ฿1,000)
  // If no match is found, compute a pseudo-realistic price based on keyword hashing in ฿100 - ฿1,000
  return getBracketPrice(kw, 100, 1000, 5);
}

export default calculateSmartPrice;

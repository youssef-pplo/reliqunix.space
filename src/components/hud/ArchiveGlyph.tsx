export function BrandMark({className=''}:{className?:string}) {
  return <svg className={className} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.3"/><ellipse cx="16" cy="16" rx="15" ry="5" transform="rotate(-42 16 16)" stroke="currentColor" strokeWidth="1.3"/><path d="M16 1v8M16 23v8M1 16h8M23 16h8" stroke="currentColor" strokeWidth="1.2"/><circle cx="16" cy="16" r="2" fill="currentColor"/></svg>;
}
export function RelicGlyph({id,className=''}:{id:string;className?:string}) {
  const rover=id==='lrv'||id==='opportunity';
  return <svg className={className} viewBox="0 0 100 76" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
    {id==='eagle'?<><path d="M31 25h38v23H31zM35 25l5-8h21l5 8M31 30l-9 24-8 6h12M69 30l9 24 8 6H74M32 44L19 58M68 44l13 14M43 48l-4 11h22l-4-11M41 27v19M58 27v19M31 36h38M50 48v14M47 54h6M46 58h8"/><ellipse cx="20" cy="62" rx="9" ry="2"/><ellipse cx="80" cy="62" rx="9" ry="2"/></>:
    rover?<><path d="M20 47h62l-6-12H28zM27 47v8M74 47v8M36 35V22h14v14M50 35V22h13v14M65 34V17l7-8M28 35V20l-5-7M34 52h36M40 54l-7 9M61 54l7 9"/>{[25,75,...(id==='opportunity'?[50]:[])].map(x=><circle key={x} cx={x} cy="59" r="9"/>)}<ellipse cx="73" cy="11" rx="10" ry="6" transform="rotate(-28 73 11)"/><path d="M17 39h68M39 27h10M52 27h10"/></>:
    id==='ingenuity'?<><path d="M42 36h16v16H42zM50 16v20M26 17h48v6H26zM15 28h70M22 33h56M44 49L27 67M56 49l17 18M50 23v7M39 43h22M26 67h7M69 67h7"/></>:
    id==='edl'?<><path d="M19 58l18-24 22 24zM33 51l6-11M63 30c2-18 24-18 27 0zM63 30l11 29M90 30L74 59M68 30l6 29M86 30L74 59M22 64h39M16 60l-7 5M62 59l5 5M73 60h9"/><path d="M67 29c3-13 16-13 19 0M72 29c0-12 9-12 9 0"/></>:
    <><path d="M50 14v34M34 39h32l-6 11H40zM38 44L17 66M62 44l21 22M50 47v20M29 25h41v8H29zM50 14l10 9M38 39L30 60M62 39l8 21"/><ellipse cx="17" cy="67" rx="7" ry="2"/><ellipse cx="83" cy="67" rx="7" ry="2"/><path d="M47 66h7"/></>}
  </svg>;
}

(() => {
  console.info("Math Problem Library: print PDF v3 loaded");
  const $ = (s) => document.querySelector(s);

  const els = {
    libraryView: $("#libraryView"),
    trainingView: $("#trainingView"),
    showLibrary: $("#showLibraryView"),
    showTraining: $("#showTrainingView"),
    category: $("#trainingCategory"),
    difficulty: $("#trainingDifficulty"),
    count: $("#trainingCount"),
    pdfMode: $("#trainingPdfMode"),
    generate: $("#generateTraining"),
    groupLabel: $("#categoryGroupLabel"),
    ruleText: $("#trainingRuleText"),
    status: $("#pdfStatus"),
    statusDetail: $("#pdfStatusDetail"),
    printRoot: $("#printRoot")
  };

  if (!els.trainingView) return;

  const DIFFICULTY = {
    1: "★ 基礎",
    2: "★★ 標準",
    3: "★★★ 模試",
    4: "★★★★ 入試標準",
    5: "★★★★★ 入試発展"
  };

  const CATEGORY = {
    expand: { name: "展開", group: "【式と計算】" },
    factor: { name: "因数分解", group: "【式と計算】" },
    completeSquare: { name: "平方完成", group: "【二次関数】" },
    diff2: { name: "微分（数学Ⅱ）", group: "【数学Ⅱ・微積分】" },
    indef2: { name: "不定積分（数学Ⅱ）", group: "【数学Ⅱ・微積分】" },
    def2: { name: "定積分（数学Ⅱ）", group: "【数学Ⅱ・微積分】" },
    diff3: { name: "微分（数学Ⅲ）", group: "【数学Ⅲ・微積分】" },
    indef3: { name: "不定積分（数学Ⅲ）", group: "【数学Ⅲ・微積分】" },
    def3: { name: "定積分（数学Ⅲ）", group: "【数学Ⅲ・微積分】" }
  };

  const RULES = {
    expand: [
      "基本公式をそのまま使う展開。",
      "係数を含む2つの式の展開。",
      "文字パラメータや複数の公式を含む展開。",
      "複数の積・差を整理する入試標準型。",
      "文字を含む複数段階の展開・整理。"
    ],
    factor: [
      "基本公式・共通因数による因数分解。",
      "たすき掛けを含む標準的な因数分解。",
      "文字パラメータを含む因数分解。",
      "置き換えや複数段階の処理を含む因数分解。",
      "高次式・文字式の構造を見抜く因数分解。"
    ],
    completeSquare: [
      "x²の係数が1で、整数だけで平方完成。",
      "x²の係数が1以外。分数が現れる場合もあります。",
      "文字 a,b を含む平方完成を解禁。",
      "分数・文字を含む入試標準型。",
      "文字係数を含み、複数段階の整理が必要な平方完成。"
    ],
    diff2: [
      "基本的な多項式の微分。",
      "項数・係数を増やした多項式の微分。",
      "展開してから微分する模試型。",
      "複数因子を展開・整理してから微分。",
      "複雑な多項式を展開・整理して微分。"
    ],
    indef2: [
      "基本的な多項式の不定積分。",
      "分数係数を含む標準的な不定積分。",
      "展開してから積分する模試型。",
      "複数因子の展開・整理を含む積分。",
      "複雑な多項式を整理して積分。"
    ],
    def2: [
      "基本的な多項式の定積分。",
      "係数・項数を増やした定積分。",
      "展開を含む模試型の定積分。",
      "複数段階の式整理を含む定積分。",
      "複雑な多項式の定積分計算。"
    ],
    diff3: [
      "三角・指数・対数・根号などの基本公式。",
      "簡単な合成関数の微分。",
      "積・商・合成のうち主要な処理を1種類。",
      "複数の微分法を組み合わせる入試標準型。",
      "2〜3種類の微分法＋整理。対数微分も出題候補。"
    ],
    indef3: [
      "数学Ⅲの基本積分公式。",
      "一次式を内側にもつ簡単な合成型。",
      "置換積分・部分積分を解禁。",
      "見抜きが必要な置換・部分積分、三角公式の変形。",
      "複数処理。部分積分を2回使う問題も出題候補。"
    ],
    def3: [
      "数学Ⅲの基本公式を使う定積分。",
      "簡単な合成型＋端点代入。",
      "置換積分・部分積分を使う定積分。",
      "積分法の判断＋三角公式の変形。",
      "複数処理・部分積分2回などの入試発展計算。"
    ]
  };

  // ---------- helpers ----------
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[randInt(0, arr.length - 1)];
  const nonZero = (min, max) => {
    let n = 0;
    while (n === 0) n = randInt(min, max);
    return n;
  };
  const gcd = (a,b) => {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a,b] = [b, a % b];
    return a || 1;
  };

  class Rat {
    constructor(n=0,d=1) {
      if (d === 0) throw new Error("zero denominator");
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(n,d);
      this.n = n/g;
      this.d = d/g;
    }
    add(o){ o=toRat(o); return new Rat(this.n*o.d+o.n*this.d,this.d*o.d); }
    sub(o){ o=toRat(o); return new Rat(this.n*o.d-o.n*this.d,this.d*o.d); }
    mul(o){ o=toRat(o); return new Rat(this.n*o.n,this.d*o.d); }
    div(o){ o=toRat(o); return new Rat(this.n*o.d,this.d*o.n); }
    neg(){ return new Rat(-this.n,this.d); }
    isZero(){ return this.n===0; }
    abs(){ return new Rat(Math.abs(this.n),this.d); }
  }
  const toRat = (x) => x instanceof Rat ? x : new Rat(x,1);

  function ratLatex(r, absolute=false){
    r = toRat(r);
    const n = absolute ? Math.abs(r.n) : r.n;
    if (r.d === 1) return String(n);
    return `\\frac{${n}}{${r.d}}`;
  }

  function coeffVarLatex(r, variable="x", power=1, absolute=true){
    r = toRat(r);
    const rr = absolute ? r.abs() : r;
    let c = "";
    if (!(Math.abs(rr.n) === rr.d)) c = ratLatex(rr, true);
    const v = power === 1 ? variable : `${variable}^{${power}}`;
    return `${c}${v}`;
  }

  function polyTrim(p){
    const q = p.map(toRat);
    while (q.length > 1 && q[q.length-1].isZero()) q.pop();
    return q;
  }

  function polyMul(a,b){
    a=a.map(toRat); b=b.map(toRat);
    const out = Array(a.length+b.length-1).fill(0).map(()=>new Rat(0));
    for(let i=0;i<a.length;i++){
      for(let j=0;j<b.length;j++){
        out[i+j] = out[i+j].add(a[i].mul(b[j]));
      }
    }
    return polyTrim(out);
  }

  function polyDerivative(p){
    p=p.map(toRat);
    if(p.length<=1) return [new Rat(0)];
    return p.slice(1).map((c,i)=>c.mul(i+1));
  }

  function polyIntegrate(p){
    p=p.map(toRat);
    const out=[new Rat(0)];
    p.forEach((c,i)=>out.push(c.div(i+1)));
    return polyTrim(out);
  }

  function polyEval(p,x){
    x=toRat(x);
    let s=new Rat(0);
    let pow=new Rat(1);
    for(const c of p){
      s=s.add(toRat(c).mul(pow));
      pow=pow.mul(x);
    }
    return s;
  }

  function polyLatex(p, variable="x"){
    p=polyTrim(p);
    const parts=[];
    for(let power=p.length-1; power>=0; power--){
      const c=p[power];
      if(c.isZero()) continue;
      const neg=c.n<0;
      let body;
      if(power===0) body=ratLatex(c.abs());
      else body=coeffVarLatex(c,variable,power,true);

      if(parts.length===0) parts.push((neg?"-":"")+body);
      else parts.push((neg?" - ":" + ")+body);
    }
    return parts.length ? parts.join("") : "0";
  }

  function linLatex(a,b, variable="x"){
    let s = "";
    if(a === 1) s = variable;
    else if(a === -1) s = `-${variable}`;
    else s = `${a}${variable}`;
    if(b>0) s += `+${b}`;
    if(b<0) s += `${b}`;
    return s;
  }

  function binomLatex(a,b, variable="x"){
    return `\\left(${linLatex(a,b,variable)}\\right)`;
  }

  function signedRatInside(r, suffix=""){
    r=toRat(r);
    if(r.isZero()) return "";
    const abs=ratLatex(r.abs());
    const coeff = abs==="1" && suffix ? "" : abs;
    return r.n>0 ? `+${coeff}${suffix}` : `-${coeff}${suffix}`;
  }

  function withC(s){ return `${s}+C`; }

  function question(instruction, expr, answer, signature, details={}){
    return { instruction, expr, answer, details, signature: signature || `${instruction}|${expr}|${answer}` };
  }

  function rhs(eq){
    const i=String(eq).indexOf("=");
    return i>=0 ? String(eq).slice(i+1) : String(eq);
  }

  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;");
  }

  // ---------- generators: 展開 ----------
  function genExpand(d){
    if(d===1){
      const a=nonZero(-6,6), b=nonZero(-6,6);
      if(Math.random()<0.35){
        const k=nonZero(2,7);
        return question("次の式を展開せよ。", `\\left(x${k>0?"+":""}${k}\\right)^2`,
          `x^2${2*k>0?"+":""}${2*k}x+${k*k}`, `esq-${k}`);
      }
      const p=[new Rat(a*b), new Rat(a+b), new Rat(1)];
      return question("次の式を展開せよ。",
        `\\left(x${a>0?"+":""}${a}\\right)\\left(x${b>0?"+":""}${b}\\right)`,
        polyLatex(p), `e1-${a}-${b}`);
    }
    if(d===2){
      const a=randInt(2,5), c=randInt(2,5), b=nonZero(-6,6), e=nonZero(-6,6);
      const p=polyMul([b,a],[e,c]);
      return question("次の式を展開せよ。", `${binomLatex(a,b)}${binomLatex(c,e)}`,
        polyLatex(p), `e2-${a}-${b}-${c}-${e}`);
    }
    if(d===3){
      const k=pick([2,3,4]), m=pick([2,3]);
      const type=Math.random()<0.5?0:1;
      if(type===0){
        return question("次の式を展開せよ。",
          `\\left(x+a\\right)\\left(x-${k}a\\right)`,
          `x^2-${k-1}ax-${k}a^2`, `e3a-${k}`);
      }
      return question("次の式を展開せよ。",
        `\\left(${m}x-a\\right)^2`,
        `${m*m}x^2-${2*m}ax+a^2`, `e3b-${m}`);
    }
    if(d===4){
      const k=pick([2,3,4]);
      // (x+a)^2 - (x-a)(x+ka)
      // first x2+2ax+a2; second x2+(k-1)ax-k a2
      // result (3-k)ax +(k+1)a2
      const ax=3-k;
      const axPart = ax===0 ? "" : (ax===1 ? "ax" : ax===-1 ? "-ax" : `${ax}ax`);
      let ans="";
      if(ax!==0) ans=axPart;
      const constTerm=`${k+1}a^2`;
      ans += ans ? `+${constTerm}` : constTerm;
      return question("次の式を展開し、整理せよ。",
        `\\left(x+a\\right)^2-\\left(x-a\\right)\\left(x+${k}a\\right)`,
        ans, `e4-${k}`);
    }
    const k=pick([2,3]), m=pick([2,3]);
    // (x+ka)^2 - (x-a)(x+ma) + a(x+a)
    // coefficients symbolic:
    // first x2+2k ax+k2a2
    // second x2+(m-1)ax-m a2
    // plus ax+a2
    // ax = 2k-(m-1)+1 = 2k-m+2
    // a2 = k2+m+1
    const A=2*k-m+2, B=k*k+m+1;
    return question("次の式を展開し、整理せよ。",
      `\\left(x+${k}a\\right)^2-\\left(x-a\\right)\\left(x+${m}a\\right)+a\\left(x+a\\right)`,
      `${A}ax+${B}a^2`, `e5-${k}-${m}`);
  }

  // ---------- generators: 因数分解 ----------
  function genFactor(d){
    if(d===1){
      if(Math.random()<0.35){
        const a=randInt(2,9);
        return question("次の式を因数分解せよ。", `x^2-${a*a}`,
          `\\left(x-${a}\\right)\\left(x+${a}\\right)`, `f1ds-${a}`);
      }
      const r=nonZero(-6,6), s=nonZero(-6,6);
      const p=[new Rat(r*s),new Rat(r+s),new Rat(1)];
      return question("次の式を因数分解せよ。", polyLatex(p),
        `\\left(x${r>0?"+":""}${r}\\right)\\left(x${s>0?"+":""}${s}\\right)`, `f1-${r}-${s}`);
    }
    if(d===2){
      const a=randInt(2,4), c=randInt(2,4), b=nonZero(-5,5), e=nonZero(-5,5);
      const p=polyMul([b,a],[e,c]);
      return question("次の式を因数分解せよ。", polyLatex(p),
        `${binomLatex(a,b)}${binomLatex(c,e)}`, `f2-${a}-${b}-${c}-${e}`);
    }
    if(d===3){
      const k=pick([2,3,4,5]);
      return question("次の式を因数分解せよ。",
        `x^2+\\left(a+${k}\\right)x+${k}a`,
        `\\left(x+a\\right)\\left(x+${k}\\right)`, `f3-${k}`);
    }
    if(d===4){
      const m=randInt(1,5), n=randInt(6,10);
      return question("次の式を因数分解せよ。",
        `x^4-${m+n}x^2+${m*n}`,
        `\\left(x^2-${m}\\right)\\left(x^2-${n}\\right)`, `f4-${m}-${n}`);
    }
    const b=pick([2,3,4,5]), c=pick([1,2,3]);
    const ax3=2*c, a2x2=c*c;
    const middleAx = c===1 ? "ax" : `${c}ax`;
    return question("次の式を因数分解せよ。",
      `x^4+${ax3}ax^3+${a2x2}a^2x^2-${b*b}`,
      `\\left(x^2+${middleAx}-${b}\\right)\\left(x^2+${middleAx}+${b}\\right)`, `f5-${b}-${c}`);
  }

  // ---------- generators: 平方完成 ----------
  function genCompleteSquare(d){
    if(d===1){
      const h=nonZero(-6,6), k=randInt(-8,8);
      // (x+h)^2+k => x2+2h x+h2+k
      const B=2*h, C=h*h+k;
      return question("次の二次式を平方完成せよ。", polyLatex([C,B,1]),
        `\\left(x${h>0?"+":""}${h}\\right)^2${k===0?"":k>0?`+${k}`:`${k}`}`,
        `cs1-${h}-${k}`);
    }
    if(d===2 || d===4){
      const A=randInt(2,5);
      let B;
      if(d===2 && Math.random()<0.55) B=2*A*nonZero(-3,3);
      else {
        B=nonZero(-9,9);
        if(B%(2*A)===0) B+=1;
      }
      const C=randInt(-8,10);
      const h=new Rat(B,2*A);
      const K=new Rat(4*A*C-B*B,4*A);
      const inside=signedRatInside(h);
      const kText=K.isZero()?"":(K.n>0?`+${ratLatex(K)}`:`-${ratLatex(K.abs())}`);
      return question("次の二次式を平方完成せよ。", polyLatex([C,B,A]),
        `${A}\\left(x${inside}\\right)^2${kText}`, `cs${d}-${A}-${B}-${C}`);
    }
    if(d===3){
      const k=pick([1,2,3]), C=randInt(-5,8);
      const sign=k>0?"+":"";
      const constText=C===0?"":C>0?`+${C}`:`${C}`;
      return question("次の二次式を平方完成せよ。",
        `x^2+${2*k}ax${constText}`,
        `\\left(x+${k}a\\right)^2-${k*k}a^2${constText}`, `cs3-${k}-${C}`);
    }
    // d5: A x2 + B a x + C a2 + D
    let A,B,C,D,K;
    do{
      A=randInt(2,5);
      B=nonZero(-7,7);
      C=randInt(-3,7);
      D=randInt(-5,7);
      K=new Rat(4*A*C-B*B,4*A);
    }while(K.isZero());
    const h=new Rat(B,2*A);
    const inside=signedRatInside(h,"a");
    const kA2 = K.n>0
      ? `+${ratLatex(K)}a^2`
      : `-${ratLatex(K.abs())}a^2`;
    const dText=D===0?"":D>0?`+${D}`:`${D}`;
    const bText=B===1?"+ax":B===-1?"-ax":B>0?`+${B}ax`:`${B}ax`;
    const cText=C===0?"":C===1?"+a^2":C===-1?"-a^2":C>0?`+${C}a^2`:`${C}a^2`;
    return question("次の二次式を平方完成せよ。",
      `${A}x^2${bText}${cText}${dText}`,
      `${A}\\left(x${inside}\\right)^2${kA2}${dText}`, `cs5-${A}-${B}-${C}-${D}`);
  }

  // ---------- polynomial random helpers ----------
  function randomPoly(degree, coeffMax=6, allowZeroMiddle=True){
    const p=[];
    for(let i=0;i<=degree;i++){
      let c;
      if(i===degree) c=nonZero(1,coeffMax);
      else c=allowZeroMiddle ? randInt(-coeffMax,coeffMax) : nonZero(-coeffMax,coeffMax);
      p.push(new Rat(c));
    }
    return polyTrim(p);
  }

  function randomLinear(){
    return [new Rat(nonZero(-6,6)), new Rat(randInt(1,4))];
  }

  function randomQuadratic(){
    return [new Rat(nonZero(-5,5)), new Rat(nonZero(-5,5)), new Rat(randInt(1,3))];
  }

  // ---------- 微分 数学II ----------
  function genDiff2(d){
    let expr, p;
    if(d===1){
      p=randomPoly(randInt(2,4),5,true);
      expr=polyLatex(p);
    } else if(d===2){
      p=randomPoly(randInt(4,6),8,true);
      expr=polyLatex(p);
    } else if(d===3){
      const a=randomLinear(), b=randomQuadratic();
      p=polyMul(a,b);
      expr=`\\left(${polyLatex(a)}\\right)\\left(${polyLatex(b)}\\right)`;
    } else if(d===4){
      const a=randomLinear(), b=randomLinear(), c=randomQuadratic();
      p=polyMul(polyMul(a,b),c);
      expr=`\\left(${polyLatex(a)}\\right)\\left(${polyLatex(b)}\\right)\\left(${polyLatex(c)}\\right)`;
    } else {
      const a=randomQuadratic(), b=randomQuadratic();
      p=polyMul(a,b);
      expr=`\\left(${polyLatex(a)}\\right)\\left(${polyLatex(b)}\\right)`;
    }
    const expanded=polyLatex(p);
    const deriv=polyLatex(polyDerivative(p));
    return question("次の関数を微分せよ。", `y=${expr}`,
      `y'=${deriv}`, `d2-${d}-${expr}`, {expanded, deriv});
  }

  // ---------- 不定積分 数学II ----------
  function genIndef2(d){
    let expr, p;
    if(d===1){
      const antiSeed=randomPoly(randInt(2,4),4,true);
      p=polyDerivative(antiSeed);
      expr=polyLatex(p);
    } else if(d===2){
      p=randomPoly(randInt(3,5),6,true);
      expr=polyLatex(p);
    } else if(d===3){
      const a=randomLinear(), b=randomQuadratic();
      p=polyMul(a,b);
      expr=`\\left(${polyLatex(a)}\\right)\\left(${polyLatex(b)}\\right)`;
    } else if(d===4){
      const a=randomLinear(), b=randomLinear(), c=randomQuadratic();
      p=polyMul(polyMul(a,b),c);
      expr=`\\left(${polyLatex(a)}\\right)\\left(${polyLatex(b)}\\right)\\left(${polyLatex(c)}\\right)`;
    } else {
      const a=randomQuadratic(), b=randomQuadratic();
      p=polyMul(a,b);
      expr=`\\left(${polyLatex(a)}\\right)\\left(${polyLatex(b)}\\right)`;
    }
    const expanded=polyLatex(p);
    const anti=polyLatex(polyIntegrate(p));
    return question("次の不定積分を求めよ。", `\\int \\left(${expr}\\right)\\,dx`,
      withC(anti), `i2-${d}-${expr}`, {expanded, anti});
  }

  // ---------- 定積分 数学II ----------
  function genDef2(d){
    let expr,p;
    if(d<=2){
      p=randomPoly(d===1?randInt(2,3):randInt(3,5),d===1?4:6,true);
      expr=polyLatex(p);
    } else if(d===3){
      const a=randomLinear(), b=randomQuadratic();
      p=polyMul(a,b);
      expr=`\\left(${polyLatex(a)}\\right)\\left(${polyLatex(b)}\\right)`;
    } else if(d===4){
      const a=randomLinear(), b=randomLinear(), c=randomQuadratic();
      p=polyMul(polyMul(a,b),c);
      expr=`\\left(${polyLatex(a)}\\right)\\left(${polyLatex(b)}\\right)\\left(${polyLatex(c)}\\right)`;
    } else {
      const a=randomQuadratic(), b=randomQuadratic();
      p=polyMul(a,b);
      expr=`\\left(${polyLatex(a)}\\right)\\left(${polyLatex(b)}\\right)`;
    }
    const lo=randInt(-2,0), hi=randInt(1,3);
    const antiPoly=polyIntegrate(p);
    const anti=polyLatex(antiPoly);
    const value=polyEval(antiPoly,hi).sub(polyEval(antiPoly,lo));
    const expanded=polyLatex(p);
    return question("次の定積分を求めよ。", `\\int_{${lo}}^{${hi}} \\left(${expr}\\right)\\,dx`,
      ratLatex(value), `di2-${d}-${expr}-${lo}-${hi}`,
      {expanded, anti, lo, hi, value:ratLatex(value)});
  }

  // ---------- 微分 数学III ----------
  function genDiff3(d){
    if(d===1){
      const c=randInt(1,6);
      const cText=c===1?"":String(c);
      return pick([
        question("次の関数を微分せよ。",`y=${cText}\sin x`,`y'=${cText}\cos x`,`d31-sin-${c}`),
        question("次の関数を微分せよ。",`y=${cText}\cos x`,`y'=-${cText}\sin x`,`d31-cos-${c}`),
        question("次の関数を微分せよ。",`y=${cText}e^x`,`y'=${cText}e^x`,`d31-exp-${c}`),
        question("次の関数を微分せよ。",`y=${cText}\log x`,`y'=\frac{${c}}{x}`,`d31-log-${c}`),
        question("次の関数を微分せよ。",`y=${cText}\sqrt{x}`,`y'=\frac{${c}}{2\sqrt{x}}`,`d31-sqrt-${c}`)
      ]);
    }
    if(d===2){
      const k=randInt(2,5), b=randInt(1,5);
      return pick([
        question("次の関数を微分せよ。",`y=\\sin ${k}x`,`y'=${k}\\cos ${k}x`,`d32-sin-${k}`),
        question("次の関数を微分せよ。",`y=e^{${k}x+${b}}`,`y'=${k}e^{${k}x+${b}}`,`d32-exp-${k}-${b}`),
        question("次の関数を微分せよ。",`y=\\log\\left(${k}x+${b}\\right)`,`y'=\\frac{${k}}{${k}x+${b}}`,`d32-log-${k}-${b}`),
        question("次の関数を微分せよ。",`y=\\sqrt{${k}x+${b}}`,`y'=\\frac{${k}}{2\\sqrt{${k}x+${b}}}`,`d32-root-${k}-${b}`)
      ]);
    }
    if(d===3){
      const n=randInt(2,4), a=randInt(1,5);
      return pick([
        question("次の関数を微分せよ。",`y=x^{${n}}e^x`,
          `y'=${n}x^{${n-1}}e^x+x^{${n}}e^x`,`d33-prod-exp-${n}`),
        question("次の関数を微分せよ。",`y=x^{${n}}\\sin x`,
          `y'=${n}x^{${n-1}}\\sin x+x^{${n}}\\cos x`,`d33-prod-sin-${n}`),
        question("次の関数を微分せよ。",`y=\\frac{e^x}{x^{${n}}}`,
          `y'=\\frac{e^x\\left(x-${n}\\right)}{x^{${n+1}}}`,`d33-quot-${n}`),
        question("次の関数を微分せよ。",`y=\\left(x^2+${a}\\right)^{${n}}`,
          `y'=${2*n}x\\left(x^2+${a}\\right)^{${n-1}}`,`d33-comp-${n}-${a}`)
      ]);
    }
    if(d===4){
      const k=randInt(2,4), m=randInt(2,4), a=randInt(1,5), n=randInt(2,4);
      return pick([
        question("次の関数を微分せよ。",`y=e^{${k}x}\\sin ${m}x`,
          `y'=e^{${k}x}\\left(${k}\\sin ${m}x+${m}\\cos ${m}x\\right)`,`d34-es-${k}-${m}`),
        question("次の関数を微分せよ。",`y=\\left(\\sin x\\right)^{${n}}`,
          `y'=${n}\\left(\\sin x\\right)^{${n-1}}\\cos x`,`d34-sinpow-${n}`),
        question("次の関数を微分せよ。",`y=\\frac{\\sin x}{x^2+${a}}`,
          `y'=\\frac{\\left(x^2+${a}\\right)\\cos x-2x\\sin x}{\\left(x^2+${a}\\right)^2}`,`d34-q-${a}`),
        question("次の関数を微分せよ。",`y=\left(x^2+${a}\right)e^{${k}x}`,
          `y'=e^{${k}x}\left(${k}\left(x^2+${a}\right)+2x\right)`,`d34-pec-${a}-${k}`)
      ]);
    }
    const a=randInt(1,5), n=randInt(2,3), k=randInt(2,4);
    if(Math.random()<0.22){
      return question("次の関数を微分せよ。","y=x^x",
        "y'=x^x\\left(\\log x+1\\right)","d35-logdiff");
    }
    return pick([
      question("次の関数を微分せよ.","y=e^{x^2}\\sin x",
        "y'=e^{x^2}\\left(2x\\sin x+\\cos x\\right)","d35-esx2"),
      question("次の関数を微分せよ.",`y=\\frac{\\sin ${k}x}{e^x}`,
        `y'=e^{-x}\\left(${k}\\cos ${k}x-\\sin ${k}x\\right)`,`d35-q-${k}`),
      question("次の関数を微分せよ。",`y=\\left(x^2+${a}\\right)^{${n}}e^{${k}x}`,
        `y'=e^{${k}x}\\left(x^2+${a}\\right)^{${n-1}}\\left(${2*n}x+${k}\\left(x^2+${a}\\right)\\right)`,
        `d35-pc-${a}-${n}-${k}`)
    ]);
  }

  // ---------- 不定積分 数学III ----------
  function genIndef3(d){
    if(d===1){
      return pick([
        question("次の不定積分を求めよ。","\\int e^x\\,dx",withC("e^x"),"i31-exp"),
        question("次の不定積分を求めよ。","\\int \\cos x\\,dx",withC("\\sin x"),"i31-cos"),
        question("次の不定積分を求めよ。","\\int \\sin x\\,dx",withC("-\\cos x"),"i31-sin"),
        question("次の不定積分を求めよ。","\\int \\frac{1}{x}\\,dx",withC("\\log|x|"),"i31-log"),
        question("次の不定積分を求めよ。","\\int \\frac{1}{\\cos^2 x}\\,dx",withC("\\tan x"),"i31-tan")
      ]);
    }
    if(d===2){
      const k=randInt(2,5), b=randInt(1,5);
      return pick([
        question("次の不定積分を求めよ。",`\\int e^{${k}x+${b}}\\,dx`,
          withC(`\\frac{1}{${k}}e^{${k}x+${b}}`),`i32-exp-${k}-${b}`),
        question("次の不定積分を求めよ。",`\\int \\cos ${k}x\\,dx`,
          withC(`\\frac{1}{${k}}\\sin ${k}x`),`i32-cos-${k}`),
        question("次の不定積分を求めよ。",`\\int \\sin ${k}x\\,dx`,
          withC(`-\\frac{1}{${k}}\\cos ${k}x`),`i32-sin-${k}`),
        question("次の不定積分を求めよ。",`\\int \\frac{1}{${k}x+${b}}\\,dx`,
          withC(`\\frac{1}{${k}}\\log\\left|${k}x+${b}\\right|`),`i32-log-${k}-${b}`)
      ]);
    }
    if(d===3){
      const a=randInt(1,5), n=randInt(2,4);
      return pick([
        question("次の不定積分を求めよ。",`\\int 2x\\left(x^2+${a}\\right)^{${n}}\\,dx`,
          withC(`\\frac{1}{${n+1}}\\left(x^2+${a}\\right)^{${n+1}}`),`i33-sub-${a}-${n}`),
        question("次の不定積分を求めよ。","\\int xe^x\\,dx",
          withC("\\left(x-1\\right)e^x"),"i33-parts-exp"),
        question("次の不定積分を求めよ。","\\int x\\cos x\\,dx",
          withC("x\\sin x+\\cos x"),"i33-parts-cos"),
        question("次の不定積分を求めよ。","\\int x\\sin x\\,dx",
          withC("-x\\cos x+\\sin x"),"i33-parts-sin")
      ]);
    }
    if(d===4){
      const a=randInt(1,5);
      return pick([
        question("次の不定積分を求めよ。",`\\int xe^{x^2+${a}}\\,dx`,
          withC(`\\frac{1}{2}e^{x^2+${a}}`),`i34-subexp-${a}`),
        question("次の不定積分を求めよ。",`\\int \\frac{x}{x^2+${a}}\\,dx`,
          withC(`\\frac{1}{2}\\log\\left(x^2+${a}\\right)`),`i34-log-${a}`),
        question("次の不定積分を求めよ。","\\int \\sin^2 x\\,dx",
          withC("\\frac{x}{2}-\\frac{\\sin 2x}{4}"),"i34-sin2"),
        question("次の不定積分を求めよ。","\\int \\cos^2 x\\,dx",
          withC("\\frac{x}{2}+\\frac{\\sin 2x}{4}"),"i34-cos2"),
        question("次の不定積分を求めよ。","\\int \\log x\\,dx",
          withC("x\\log x-x"),"i34-logx")
      ]);
    }
    const c=randInt(1,5);
    const cText=c===1?"":String(c);
    return pick([
      question("次の不定積分を求めよ。",`\\int ${cText}x^2e^x\\,dx`,
        withC(`${cText}e^x\\left(x^2-2x+2\\right)`),`i35-x2exp-${c}`),
      question("次の不定積分を求めよ。",`\\int ${cText}e^x\\sin x\\,dx`,
        withC(`\\frac{${c}e^x}{2}\\left(\\sin x-\\cos x\\right)`),`i35-expsin-${c}`),
      question("次の不定積分を求めよ。",`\\int ${cText}e^x\\cos x\\,dx`,
        withC(`\\frac{${c}e^x}{2}\\left(\\sin x+\\cos x\\right)`),`i35-expcos-${c}`),
      question("次の不定積分を求めよ。",`\\int ${cText}x^2\\cos x\\,dx`,
        withC(`${cText}\\left(x^2\\sin x+2x\\cos x-2\\sin x\\right)`),`i35-x2cos-${c}`)
    ]);
  }

  // ---------- 定積分 数学III ----------
  function genDef3(d){
    if(d===1){
      return pick([
        question("次の定積分を求めよ。","\\int_0^1 e^x\\,dx","e-1","di31-exp"),
        question("次の定積分を求めよ。","\\int_0^{\\frac{\\pi}{2}}\\cos x\\,dx","1","di31-cos"),
        question("次の定積分を求めよ。","\\int_1^e \\frac{1}{x}\\,dx","1","di31-log")
      ]);
    }
    if(d===2){
      const k=randInt(2,5);
      return pick([
        question("次の定積分を求めよ。",`\\int_0^1 e^{${k}x}\\,dx`,
          `\\frac{e^{${k}}-1}{${k}}`,`di32-exp-${k}`),
        question("次の定積分を求めよ。",`\\int_0^{\\frac{\\pi}{${2*k}}}\\cos ${k}x\\,dx`,
          `\\frac{1}{${k}}`,`di32-cos-${k}`),
        question("次の定積分を求めよ。",`\\int_0^1 \\frac{1}{${k}x+1}\\,dx`,
          `\\frac{1}{${k}}\\log\\left(${k+1}\\right)`,`di32-log-${k}`)
      ]);
    }
    if(d===3){
      const a=randInt(1,4), n=randInt(2,3);
      const num=(a+1)**(n+1)-a**(n+1);
      return pick([
        question("次の定積分を求めよ。",`\\int_0^1 2x\\left(x^2+${a}\\right)^{${n}}\\,dx`,
          ratLatex(new Rat(num,n+1)),`di33-sub-${a}-${n}`),
        question("次の定積分を求めよ。","\\int_0^1 xe^x\\,dx","1","di33-parts"),
        question("次の定積分を求めよ。","\\int_0^{\\frac{\\pi}{2}}x\\cos x\\,dx",
          "\\frac{\\pi}{2}-1","di33-xcos")
      ]);
    }
    if(d===4){
      const a=randInt(1,5);
      return pick([
        question("次の定積分を求めよ。","\\int_0^1 xe^{x^2}\\,dx",
          "\\frac{e-1}{2}","di34-xexp"),
        question("次の定積分を求めよ。",`\\int_0^1 \\frac{x}{x^2+${a}}\\,dx`,
          `\\frac{1}{2}\\log\\left(\\frac{${a+1}}{${a}}\\right)`,`di34-log-${a}`),
        question("次の定積分を求めよ。","\\int_0^{\\frac{\\pi}{2}}\\sin^2 x\\,dx",
          "\\frac{\\pi}{4}","di34-sin2"),
        question("次の定積分を求めよ。","\\int_1^e \\log x\\,dx","1","di34-logx")
      ]);
    }
    const c=randInt(1,5);
    const cText=c===1?"":String(c);
    return pick([
      question("次の定積分を求めよ。",`\\int_0^1 ${cText}x^2e^x\\,dx`,`${c===1?"":c+"\\left("}e-2${c===1?"":"\\right)"}`,`di35-x2exp-${c}`),
      question("次の定積分を求めよ。",`\\int_0^{\\frac{\\pi}{2}}${cText}e^x\\sin x\\,dx`,
        `\\frac{${c}\\left(e^{\\frac{\\pi}{2}}+1\\right)}{2}`,`di35-expsin-${c}`),
      question("次の定積分を求めよ。",`\\int_0^{\\frac{\\pi}{2}}${cText}e^x\\cos x\\,dx`,
        `\\frac{${c}\\left(e^{\\frac{\\pi}{2}}-1\\right)}{2}`,`di35-expcos-${c}`),
      question("次の定積分を求めよ。",`\\int_0^{\\frac{\\pi}{2}}${cText}x^2\\cos x\\,dx`,
        `${c===1?"":c+"\\left("}\\frac{\\pi^2}{4}-2${c===1?"":"\\right)"}`,`di35-x2cos-${c}`)
    ]);
  }

  const GENERATORS = {
    expand: genExpand,
    factor: genFactor,
    completeSquare: genCompleteSquare,
    diff2: genDiff2,
    indef2: genIndef2,
    def2: genDef2,
    diff3: genDiff3,
    indef3: genIndef3,
    def3: genDef3
  };

  function updateCategoryHelp(){
    const key=els.category.value;
    const d=Number(els.difficulty.value);
    els.groupLabel.textContent=CATEGORY[key].group;
    els.ruleText.textContent=RULES[key][d-1];
  }

  function setStatus(title, detail, busy=false, error=false){
    els.status.classList.toggle("busy",busy);
    els.status.classList.toggle("error",error);
    const strong=els.status.querySelector("strong");
    if(strong) strong.textContent=title;
    els.statusDetail.textContent=detail;
  }

  function makeSet(key,d,count){
    const gen=GENERATORS[key];
    const items=[];
    const signatures=new Set();
    let attempts=0;
    while(items.length<count && attempts<count*80){
      attempts++;
      const item=gen(d);
      if(!signatures.has(item.signature)){
        signatures.add(item.signature);
        items.push(item);
      }
    }
    // Some basic Math III template pools are intentionally finite.
    while(items.length<count) items.push(gen(d));
    return items;
  }

  function latexSignedInteger(n, tail=""){
    if(n===0) return "";
    if(n===1 && tail) return `+${tail}`;
    if(n===-1 && tail) return `-${tail}`;
    return n>0 ? `+${n}${tail}` : `${n}${tail}`;
  }

  function solutionCompleteSquare(item){
    const sig=item.signature.split("-");
    if(item.signature.startsWith("cs1-")){
      const h=Number(sig[1]), k=Number(sig[2]);
      const C=h*h+k;
      const original=polyLatex([C,2*h,1]);
      const kText=k===0?"":k>0?`+${k}`:`${k}`;
      return `\\begin{aligned}
y&=${original}\\\\
&=\\left(x${h>0?"+":""}${h}\\right)^2-${h*h}+${C}\\\\
&=\\left(x${h>0?"+":""}${h}\\right)^2${kText}
\\end{aligned}`;
    }
    if(item.signature.startsWith("cs2-") || item.signature.startsWith("cs4-")){
      const A=Number(sig[1]), B=Number(sig[2]), C=Number(sig[3]);
      const h=new Rat(B,2*A);
      const q=new Rat(B,A);
      const K=new Rat(4*A*C-B*B,4*A);
      const qTerm=q.n>0?`+${ratLatex(q)}x`:`-${ratLatex(q.abs())}x`;
      const inside=signedRatInside(h);
      const h2=h.mul(h);
      const kText=K.isZero()?"":K.n>0?`+${ratLatex(K)}`:`-${ratLatex(K.abs())}`;
      return `\\begin{aligned}
y&=${polyLatex([C,B,A])}\\\\
&=${A}\\left(x^2${qTerm}\\right)${C===0?"":C>0?`+${C}`:`${C}`}\\\\
&=${A}\\left\\{\\left(x${inside}\\right)^2-${ratLatex(h2)}\\right\\}${C===0?"":C>0?`+${C}`:`${C}`}\\\\
&=${A}\\left(x${inside}\\right)^2${kText}
\\end{aligned}`;
    }
    if(item.signature.startsWith("cs3-")){
      const k=Number(sig[1]), C=Number(sig[2]);
      const cText=C===0?"":C>0?`+${C}`:`${C}`;
      return `\\begin{aligned}
y&=x^2+${2*k}ax${cText}\\\\
&=x^2+${2*k}ax+${k*k}a^2-${k*k}a^2${cText}\\\\
&=\\left(x+${k===1?"":k}a\\right)^2-${k*k}a^2${cText}
\\end{aligned}`;
    }
    if(item.signature.startsWith("cs5-")){
      const A=Number(sig[1]), B=Number(sig[2]), C=Number(sig[3]), D=Number(sig[4]);
      const q=new Rat(B,A), h=new Rat(B,2*A);
      const K=new Rat(4*A*C-B*B,4*A);
      const bText=latexSignedInteger(B,"ax");
      const cText=latexSignedInteger(C,"a^2");
      const dText=D===0?"":D>0?`+${D}`:`${D}`;
      const qax=q.n>0?`+${ratLatex(q)}ax`:`-${ratLatex(q.abs())}ax`;
      const inside=signedRatInside(h,"a");
      const h2=h.mul(h);
      const kA2=K.n>0?`+${ratLatex(K)}a^2`:`-${ratLatex(K.abs())}a^2`;
      return `\\begin{aligned}
y&=${A}x^2${bText}${cText}${dText}\\\\
&=${A}\\left(x^2${qax}\\right)${cText}${dText}\\\\
&=${A}\\left\\{\\left(x${inside}\\right)^2-${ratLatex(h2)}a^2\\right\\}${cText}${dText}\\\\
&=${A}\\left(x${inside}\\right)^2${kA2}${dText}
\\end{aligned}`;
    }
    return `y=${item.answer}`;
  }

  function solutionDiff2(item,d){
    const expanded=item.details.expanded || rhs(item.expr);
    const deriv=item.details.deriv || rhs(item.answer);
    if(d<=2){
      return `\\begin{aligned}
y&=${expanded}\\\\
y'&=${deriv}
\\end{aligned}`;
    }
    return `\\begin{aligned}
y&=${rhs(item.expr)}\\\\
&=${expanded}\\\\
y'&=${deriv}
\\end{aligned}`;
  }

  function solutionIndef2(item,d){
    const expanded=item.details.expanded || "";
    const anti=item.details.anti || rhs(item.answer).replace(/\\+C$/,"");
    if(d<=2){
      return `\\begin{aligned}
${item.expr}&=${anti}+C
\\end{aligned}`;
    }
    return `\\begin{aligned}
${item.expr}
&=\\int\\left(${expanded}\\right)\\,dx\\\\
&=${anti}+C
\\end{aligned}`;
  }

  function solutionDef2(item,d){
    const {expanded,anti,lo,hi,value}=item.details;
    const first = d<=2 ? item.expr : `${item.expr}=\\int_{${lo}}^{${hi}}\\left(${expanded}\\right)\\,dx`;
    return `\\begin{aligned}
${first}\\\\
&=\\left[${anti}\\right]_{${lo}}^{${hi}}\\\\
&=${value}
\\end{aligned}`;
  }

  function solutionDiff3(item){
    const s=item.signature.split("-");
    const final=rhs(item.answer);

    if(item.signature.startsWith("d31-")){
      const kind=s[1], c=Number(s[2]||1), ct=c===1?"":String(c);
      if(kind==="sin") return `\\begin{aligned}y'&=${ct}(\\sin x)'\\\\&=${final}\\end{aligned}`;
      if(kind==="cos") return `\\begin{aligned}y'&=${ct}(\\cos x)'\\\\&=${final}\\end{aligned}`;
      if(kind==="exp") return `\\begin{aligned}y'&=${ct}(e^x)'\\\\&=${final}\\end{aligned}`;
      if(kind==="log") return `\\begin{aligned}y'&=${ct}(\\log x)'\\\\&=${final}\\end{aligned}`;
      if(kind==="sqrt") return `\\begin{aligned}y'&=${ct}(\\sqrt{x})'\\\\&=${final}\\end{aligned}`;
    }

    if(item.signature.startsWith("d32-")){
      const kind=s[1], k=Number(s[2]);
      if(kind==="sin") return `\\begin{aligned}y'&=\\cos ${k}x\\cdot ${k}\\\\&=${final}\\end{aligned}`;
      if(kind==="exp") return `\\begin{aligned}y'&=e^{${k}x+${s[3]}}\\cdot ${k}\\\\&=${final}\\end{aligned}`;
      if(kind==="log") return `\\begin{aligned}y'&=\\frac{1}{${k}x+${s[3]}}\\cdot ${k}\\\\&=${final}\\end{aligned}`;
      if(kind==="root") return `\\begin{aligned}y'&=\\frac{1}{2\\sqrt{${k}x+${s[3]}}}\\cdot ${k}\\\\&=${final}\\end{aligned}`;
    }

    if(item.signature.startsWith("d33-prod-exp-")){
      const n=Number(s[3]);
      return `\\begin{aligned}
y'&=(x^{${n}})'e^x+x^{${n}}(e^x)'\\\\
&=${n}x^{${n-1}}e^x+x^{${n}}e^x
\\end{aligned}`;
    }
    if(item.signature.startsWith("d33-prod-sin-")){
      const n=Number(s[3]);
      return `\\begin{aligned}
y'&=(x^{${n}})'\\sin x+x^{${n}}(\\sin x)'\\\\
&=${final}
\\end{aligned}`;
    }
    if(item.signature.startsWith("d33-quot-")){
      const n=Number(s[2]);
      return `\\begin{aligned}
y'&=\\frac{e^x x^{${n}}-e^x\\cdot ${n}x^{${n-1}}}{x^{${2*n}}}\\\\
&=${final}
\\end{aligned}`;
    }
    if(item.signature.startsWith("d33-comp-")){
      const n=Number(s[2]), a=Number(s[3]);
      return `\\begin{aligned}
y'&=${n}\\left(x^2+${a}\\right)^{${n-1}}\\cdot 2x\\\\
&=${final}
\\end{aligned}`;
    }

    if(item.signature.startsWith("d34-es-")){
      const k=Number(s[2]), m=Number(s[3]);
      return `\\begin{aligned}
y'&=(e^{${k}x})'\\sin ${m}x+e^{${k}x}(\\sin ${m}x)'\\\\
&=${k}e^{${k}x}\\sin ${m}x+${m}e^{${k}x}\\cos ${m}x\\\\
&=${final}
\\end{aligned}`;
    }
    if(item.signature.startsWith("d34-sinpow-")){
      const n=Number(s[2]);
      return `\\begin{aligned}
y'&=${n}(\\sin x)^{${n-1}}(\\sin x)'\\\\
&=${final}
\\end{aligned}`;
    }
    if(item.signature.startsWith("d34-q-")){
      const a=Number(s[2]);
      return `\\begin{aligned}
y'&=\\frac{(\\sin x)'(x^2+${a})-\\sin x\\,(x^2+${a})'}{(x^2+${a})^2}\\\\
&=${final}
\\end{aligned}`;
    }
    if(item.signature.startsWith("d34-pec-")){
      const a=Number(s[2]), k=Number(s[3]);
      return `\\begin{aligned}
y'&=2xe^{${k}x}+(x^2+${a})\\cdot ${k}e^{${k}x}\\\\
&=${final}
\\end{aligned}`;
    }

    if(item.signature==="d35-logdiff"){
      return `\\begin{aligned}
y&=x^x\\\\
\\log y&=x\\log x\\\\
\\frac{y'}{y}&=\\log x+1\\\\
y'&=x^x(\\log x+1)
\\end{aligned}`;
    }
    if(item.signature==="d35-esx2"){
      return `\\begin{aligned}
y'&=(e^{x^2})'\\sin x+e^{x^2}(\\sin x)'\\\\
&=2xe^{x^2}\\sin x+e^{x^2}\\cos x\\\\
&=${final}
\\end{aligned}`;
    }
    if(item.signature.startsWith("d35-q-")){
      const k=Number(s[2]);
      return `\\begin{aligned}
y&=e^{-x}\\sin ${k}x\\\\
y'&=-e^{-x}\\sin ${k}x+${k}e^{-x}\\cos ${k}x\\\\
&=${final}
\\end{aligned}`;
    }
    if(item.signature.startsWith("d35-pc-")){
      const a=Number(s[2]), n=Number(s[3]), k=Number(s[4]);
      return `\\begin{aligned}
y'&=\\left\\{${n}(x^2+${a})^{${n-1}}\\cdot 2x\\right\\}e^{${k}x}\\\\
&\\quad +(x^2+${a})^{${n}}\\cdot ${k}e^{${k}x}\\\\
&=${final}
\\end{aligned}`;
    }
    return `y'=${final}`;
  }

  function solutionIndef3(item){
    const s=item.signature.split("-");
    const ans=item.answer;

    if(item.signature.startsWith("i31-"))
      return `\\begin{aligned}${item.expr}&=${ans}\\end{aligned}`;

    if(item.signature.startsWith("i32-")){
      const kind=s[1], k=Number(s[2]);
      if(kind==="exp") return `\\begin{aligned}${item.expr}&=\\frac{1}{${k}}e^{${k}x+${s[3]}}+C\\end{aligned}`;
      if(kind==="cos") return `\\begin{aligned}${item.expr}&=\\frac{1}{${k}}\\sin ${k}x+C\\end{aligned}`;
      if(kind==="sin") return `\\begin{aligned}${item.expr}&=-\\frac{1}{${k}}\\cos ${k}x+C\\end{aligned}`;
      if(kind==="log") return `\\begin{aligned}${item.expr}&=\\frac{1}{${k}}\\log\\left|${k}x+${s[3]}\\right|+C\\end{aligned}`;
    }

    if(item.signature.startsWith("i33-sub-")){
      const a=Number(s[2]), n=Number(s[3]);
      return `\\begin{aligned}
t&=x^2+${a},\\quad dt=2x\\,dx\\\\
${item.expr}&=\\int t^{${n}}\\,dt\\\\
&=\\frac{1}{${n+1}}t^{${n+1}}+C\\\\
&=${ans}
\\end{aligned}`;
    }
    if(item.signature==="i33-parts-exp"){
      return `\\begin{aligned}
u&=x,\\quad dv=e^x\\,dx\\\\
du&=dx,\\quad v=e^x\\\\
\\int xe^x\\,dx&=xe^x-\\int e^x\\,dx\\\\
&=(x-1)e^x+C
\\end{aligned}`;
    }
    if(item.signature==="i33-parts-cos"){
      return `\\begin{aligned}
u&=x,\\quad dv=\\cos x\\,dx\\\\
du&=dx,\\quad v=\\sin x\\\\
\\int x\\cos x\\,dx&=x\\sin x-\\int\\sin x\\,dx\\\\
&=x\\sin x+\\cos x+C
\\end{aligned}`;
    }
    if(item.signature==="i33-parts-sin"){
      return `\\begin{aligned}
u&=x,\\quad dv=\\sin x\\,dx\\\\
du&=dx,\\quad v=-\\cos x\\\\
\\int x\\sin x\\,dx&=-x\\cos x+\\int\\cos x\\,dx\\\\
&=-x\\cos x+\\sin x+C
\\end{aligned}`;
    }

    if(item.signature.startsWith("i34-subexp-")){
      const a=Number(s[2]);
      return `\\begin{aligned}
t&=x^2+${a},\\quad dt=2x\\,dx\\\\
\\int xe^{x^2+${a}}\\,dx&=\\frac12\\int e^t\\,dt\\\\
&=\\frac12e^t+C\\\\
&=${ans}
\\end{aligned}`;
    }
    if(item.signature.startsWith("i34-log-")){
      const a=Number(s[2]);
      return `\\begin{aligned}
t&=x^2+${a},\\quad dt=2x\\,dx\\\\
\\int\\frac{x}{x^2+${a}}\\,dx&=\\frac12\\int\\frac1t\\,dt\\\\
&=${ans}
\\end{aligned}`;
    }
    if(item.signature==="i34-sin2"){
      return `\\begin{aligned}
\\sin^2x&=\\frac{1-\\cos2x}{2}\\\\
\\int\\sin^2x\\,dx&=\\frac12\\int(1-\\cos2x)\\,dx\\\\
&=\\frac{x}{2}-\\frac{\\sin2x}{4}+C
\\end{aligned}`;
    }
    if(item.signature==="i34-cos2"){
      return `\\begin{aligned}
\\cos^2x&=\\frac{1+\\cos2x}{2}\\\\
\\int\\cos^2x\\,dx&=\\frac12\\int(1+\\cos2x)\\,dx\\\\
&=\\frac{x}{2}+\\frac{\\sin2x}{4}+C
\\end{aligned}`;
    }
    if(item.signature==="i34-logx"){
      return `\\begin{aligned}
u&=\\log x,\\quad dv=dx\\\\
du&=\\frac1x dx,\\quad v=x\\\\
\\int\\log x\\,dx&=x\\log x-\\int1\\,dx\\\\
&=x\\log x-x+C
\\end{aligned}`;
    }

    if(item.signature.startsWith("i35-x2exp-")){
      const c=Number(s[2]);
      const ct=c===1?"":String(c);
      return `\\begin{aligned}
\\int ${ct}x^2e^x\\,dx
&=${ct}x^2e^x-2${ct}\\int xe^x\\,dx\\\\
&=${ct}x^2e^x-2${ct}\\left(xe^x-e^x\\right)+C\\\\
&=${ans}
\\end{aligned}`;
    }
    if(item.signature.startsWith("i35-expsin-")){
      const c=Number(s[2]), ct=c===1?"":String(c);
      return `\\begin{aligned}
I&=\\int ${ct}e^x\\sin x\\,dx\\\\
&=${ct}e^x\\sin x-\\int ${ct}e^x\\cos x\\,dx\\\\
&=${ct}e^x\\sin x-${ct}e^x\\cos x-I\\\\
2I&=${ct}e^x(\\sin x-\\cos x)\\\\
I&=${ans}
\\end{aligned}`;
    }
    if(item.signature.startsWith("i35-expcos-")){
      const c=Number(s[2]), ct=c===1?"":String(c);
      return `\\begin{aligned}
I&=\\int ${ct}e^x\\cos x\\,dx\\\\
&=${ct}e^x\\cos x+\\int ${ct}e^x\\sin x\\,dx\\\\
&=${ct}e^x\\cos x+${ct}e^x\\sin x-I\\\\
I&=${ans}
\\end{aligned}`;
    }
    if(item.signature.startsWith("i35-x2cos-")){
      const c=Number(s[2]), ct=c===1?"":String(c);
      return `\\begin{aligned}
\\int ${ct}x^2\\cos x\\,dx
&=${ct}x^2\\sin x-2${ct}\\int x\\sin x\\,dx\\\\
&=${ct}x^2\\sin x+2${ct}x\\cos x-2${ct}\\sin x+C
\\end{aligned}`;
    }
    return `\\begin{aligned}${item.expr}&=${ans}\\end{aligned}`;
  }

  function solutionDef3(item){
    const s=item.signature.split("-");
    const ans=item.answer;

    if(item.signature==="di31-exp")
      return `\\begin{aligned}\\int_0^1e^x\\,dx&=[e^x]_0^1\\\\&=e-1\\end{aligned}`;
    if(item.signature==="di31-cos")
      return `\\begin{aligned}\\int_0^{\\frac\\pi2}\\cos x\\,dx&=[\\sin x]_0^{\\frac\\pi2}\\\\&=1\\end{aligned}`;
    if(item.signature==="di31-log")
      return `\\begin{aligned}\\int_1^e\\frac1x\\,dx&=[\\log x]_1^e\\\\&=1\\end{aligned}`;

    if(item.signature.startsWith("di32-exp-")){
      const k=Number(s[2]);
      return `\\begin{aligned}${item.expr}&=\\left[\\frac1${k}e^{${k}x}\\right]_0^1\\\\&=${ans}\\end{aligned}`;
    }
    if(item.signature.startsWith("di32-cos-")){
      const k=Number(s[2]);
      return `\\begin{aligned}${item.expr}&=\\left[\\frac1${k}\\sin ${k}x\\right]_0^{\\frac{\\pi}{${2*k}}}\\\\&=${ans}\\end{aligned}`;
    }
    if(item.signature.startsWith("di32-log-")){
      const k=Number(s[2]);
      return `\\begin{aligned}${item.expr}&=\\left[\\frac1${k}\\log(${k}x+1)\\right]_0^1\\\\&=${ans}\\end{aligned}`;
    }

    if(item.signature.startsWith("di33-sub-")){
      const a=Number(s[2]), n=Number(s[3]);
      return `\\begin{aligned}
t&=x^2+${a},\\quad dt=2x\\,dx\\\\
x=0&\\Rightarrow t=${a},\\quad x=1\\Rightarrow t=${a+1}\\\\
${item.expr}&=\\int_${a}^{${a+1}}t^{${n}}\\,dt\\\\
&=\\left[\\frac{t^{${n+1}}}{${n+1}}\\right]_${a}^{${a+1}}\\\\
&=${ans}
\\end{aligned}`;
    }
    if(item.signature==="di33-parts"){
      return `\\begin{aligned}
\\int_0^1xe^x\\,dx&=[xe^x]_0^1-\\int_0^1e^x\\,dx\\\\
&=e-(e-1)\\\\
&=1
\\end{aligned}`;
    }
    if(item.signature==="di33-xcos"){
      return `\\begin{aligned}
\\int_0^{\\frac\\pi2}x\\cos x\\,dx
&=[x\\sin x]_0^{\\frac\\pi2}-\\int_0^{\\frac\\pi2}\\sin x\\,dx\\\\
&=\\frac\\pi2-1
\\end{aligned}`;
    }

    if(item.signature==="di34-xexp"){
      return `\\begin{aligned}
t&=x^2,\\quad dt=2x\\,dx\\\\
\\int_0^1xe^{x^2}\\,dx&=\\frac12\\int_0^1e^t\\,dt\\\\
&=\\frac12[e^t]_0^1\\\\
&=\\frac{e-1}{2}
\\end{aligned}`;
    }
    if(item.signature.startsWith("di34-log-")){
      const a=Number(s[2]);
      return `\\begin{aligned}
t&=x^2+${a},\\quad dt=2x\\,dx\\\\
${item.expr}&=\\frac12\\int_${a}^{${a+1}}\\frac1t\\,dt\\\\
&=\\frac12[\\log t]_${a}^{${a+1}}\\\\
&=${ans}
\\end{aligned}`;
    }
    if(item.signature==="di34-sin2"){
      return `\\begin{aligned}
\\sin^2x&=\\frac{1-\\cos2x}{2}\\\\
\\int_0^{\\frac\\pi2}\\sin^2x\\,dx
&=\\left[\\frac{x}{2}-\\frac{\\sin2x}{4}\\right]_0^{\\frac\\pi2}\\\\
&=\\frac\\pi4
\\end{aligned}`;
    }
    if(item.signature==="di34-logx"){
      return `\\begin{aligned}
\\int_1^e\\log x\\,dx
&=[x\\log x-x]_1^e\\\\
&=1
\\end{aligned}`;
    }

    if(item.signature.startsWith("di35-x2exp-")){
      const c=Number(s[2]), ct=c===1?"":String(c);
      return `\\begin{aligned}
\\int_0^1${ct}x^2e^x\\,dx
&=\\left[${ct}e^x(x^2-2x+2)\\right]_0^1\\\\
&=${ans}
\\end{aligned}`;
    }
    if(item.signature.startsWith("di35-expsin-")){
      const c=Number(s[2]), ct=c===1?"":String(c);
      return `\\begin{aligned}
\\int ${ct}e^x\\sin x\\,dx
&=\\frac{${c}e^x}{2}(\\sin x-\\cos x)\\\\
${item.expr}
&=\\left[\\frac{${c}e^x}{2}(\\sin x-\\cos x)\\right]_0^{\\frac\\pi2}\\\\
&=${ans}
\\end{aligned}`;
    }
    if(item.signature.startsWith("di35-expcos-")){
      const c=Number(s[2]), ct=c===1?"":String(c);
      return `\\begin{aligned}
\\int ${ct}e^x\\cos x\\,dx
&=\\frac{${c}e^x}{2}(\\sin x+\\cos x)\\\\
${item.expr}
&=\\left[\\frac{${c}e^x}{2}(\\sin x+\\cos x)\\right]_0^{\\frac\\pi2}\\\\
&=${ans}
\\end{aligned}`;
    }
    if(item.signature.startsWith("di35-x2cos-")){
      const c=Number(s[2]), ct=c===1?"":String(c);
      return `\\begin{aligned}
\\int ${ct}x^2\\cos x\\,dx
&=${ct}(x^2\\sin x+2x\\cos x-2\\sin x)\\\\
${item.expr}
&=\\left[${ct}(x^2\\sin x+2x\\cos x-2\\sin x)\\right]_0^{\\frac\\pi2}\\\\
&=${ans}
\\end{aligned}`;
    }
    return `\\begin{aligned}${item.expr}&=${ans}\\end{aligned}`;
  }

  function solutionLatex(item,key,d){
    if(key==="expand" || key==="factor")
      return `\\begin{aligned}${item.expr}&=${item.answer}\\end{aligned}`;
    if(key==="completeSquare") return solutionCompleteSquare(item);
    if(key==="diff2") return solutionDiff2(item,d);
    if(key==="indef2") return solutionIndef2(item,d);
    if(key==="def2") return solutionDef2(item,d);
    if(key==="diff3") return solutionDiff3(item);
    if(key==="indef3") return solutionIndef3(item);
    if(key==="def3") return solutionDef3(item);
    return item.answer;
  }

  function problemExpression(item,key){
    if(key==="completeSquare") return `y=${item.expr}`;
    return item.expr;
  }

  function chunk(arr,size){
    const out=[];
    for(let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size));
    return out;
  }

  function pageShell(kind,title,meta,inner){
    return `<section class="pdf-page">
      <div class="pdf-page-header">
        <div>
          <div class="pdf-eyebrow">CALCULATION TRAINING</div>
          <h1>${escapeHtml(title)}</h1>
          <div class="pdf-meta">${escapeHtml(meta)}</div>
        </div>
        <div class="pdf-kind">${escapeHtml(kind)}</div>
      </div>
      ${kind==="問題" ? `<div class="pdf-name-row">氏名：<span></span><span class="pdf-date">実施日：　　　月　　　日</span></div>` : ""}
      <div class="pdf-page-body">${inner}</div>
      <div class="pdf-page-footer">数学問題ライブラリ・計算トレーニング</div>
    </section>`;
  }

  function setInstruction(key){
    const map={
      expand:"次の式を展開せよ。",
      factor:"次の式を因数分解せよ。",
      completeSquare:"次の二次関数を平方完成せよ。",
      diff2:"次の関数を微分せよ。",
      indef2:"次の不定積分を求めよ。",
      def2:"次の定積分を求めよ。",
      diff3:"次の関数を微分せよ。",
      indef3:"次の不定積分を求めよ。",
      def3:"次の定積分を求めよ。"
    };
    return map[key] || "次の問いに答えよ。";
  }

  function makeProblemPages(items,key,title,meta){
    const detailed=!["expand","factor"].includes(key);
    const perPage=detailed?4:5;
    const groups=chunk(items,perPage);

    return groups.map((group,pageIndex)=>{
      const firstPageInstruction = pageIndex===0
        ? `<div class="pdf-set-instruction">${escapeHtml(setInstruction(key))}</div>`
        : "";

      const body=firstPageInstruction + group.map((item,idx)=>{
        const globalIndex=pageIndex*perPage+idx+1;
        return `<article class="pdf-problem-item ${detailed?"detailed":""}">
          <div class="pdf-problem-number">(${globalIndex})</div>
          <div class="pdf-problem-main">
            <div class="pdf-math">\\[${problemExpression(item,key)}\\]</div>
            <div class="pdf-work-space"></div>
          </div>
        </article>`;
      }).join("");

      return pageShell("問題",title,meta,body);
    });
  }

  function makeSolutionPages(items,key,d,title,meta){
    const detailed=!["expand","factor"].includes(key);
    const perPage=detailed?2:4;
    return chunk(items,perPage).map(group=>{
      const body=group.map(item=>{
        const globalIndex=items.indexOf(item)+1;
        return `<article class="pdf-solution-item ${detailed?"detailed":""}">
          <div class="pdf-solution-number">(${globalIndex})</div>
          <div class="pdf-solution-main">
            <div class="pdf-original">\\[${problemExpression(item,key)}\\]</div>
            <div class="pdf-solution-label">解答${detailed?"・途中式":""}</div>
            <div class="pdf-solution-math">\\[${solutionLatex(item,key,d)}\\]</div>
          </div>
        </article>`;
      }).join("");
      return pageShell("解答",`${title}　解答・途中式`,meta,body);
    });
  }

  async function waitForMathJax(){
    const started=Date.now();
    while(Date.now()-started<12000){
      if(window.MathJax?.typesetPromise) return;
      await new Promise(r=>setTimeout(r,100));
    }
    throw new Error("数式表示の準備が完了しませんでした。ページを再読み込みして、もう一度お試しください。");
  }

  async function openPrintPdf(items,key,d,mode){
    await waitForMathJax();

    const title=CATEGORY[key].name;
    const meta=`${CATEGORY[key].group} ／ ${DIFFICULTY[d]} ／ ${items.length}問`;
    let pageHtml=[];
    if(mode==="full" || mode==="problems")
      pageHtml.push(...makeProblemPages(items,key,title,meta));
    if(mode==="full" || mode==="solutions")
      pageHtml.push(...makeSolutionPages(items,key,d,title,meta));

    els.printRoot.innerHTML=pageHtml.join("");
    els.printRoot.setAttribute("aria-hidden","false");

    const pages=[...els.printRoot.querySelectorAll(".pdf-page")];
    pages.forEach((p,i)=>{
      const f=p.querySelector(".pdf-page-footer");
      if(f) f.textContent=`数学問題ライブラリ・計算トレーニング　　${i+1} / ${pages.length}`;
    });

    setStatus("PDF準備中",`数式を組版しています…（全${pages.length}ページ）`,true,false);

    // Clear prior MathJax generated content before typesetting a fresh set.
    if(window.MathJax?.typesetClear){
      try { window.MathJax.typesetClear([els.printRoot]); } catch(_){}
    }
    await window.MathJax.typesetPromise([els.printRoot]);
    if(document.fonts?.ready) await document.fonts.ready;
    await new Promise(r=>setTimeout(r,180));

    setStatus(
      "印刷画面を開きます",
      "印刷画面の「プリンター」または「送信先」で「PDFとして保存」を選択してください。",
      false,
      false
    );

    // Use the browser's native print/PDF workflow for maximum reliability.
    const cleanupAfterPrint = () => {
      els.printRoot.innerHTML="";
      els.printRoot.setAttribute("aria-hidden","true");
      setStatus(
        "準備完了（印刷PDF版 v3）",
        "別のPDFを作る場合は、条件を選び直して「PDFを作成」を押してください。",
        false,
        false
      );
    };

    window.addEventListener("afterprint", cleanupAfterPrint, {once:true});

    // Let the browser complete layout after MathJax rendering before opening print preview.
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    window.print();

    // Fallback for browsers that do not fire afterprint reliably.
    setTimeout(() => {
      if(els.printRoot.innerHTML) cleanupAfterPrint();
    }, 30000);
  }

  async function generatePdf(){
    if(els.generate.disabled) return;
    const key=els.category.value;
    const d=Number(els.difficulty.value);
    const count=Number(els.count.value);
    const mode=els.pdfMode.value;

    els.generate.disabled=true;
    const original=els.generate.textContent;
    els.generate.textContent="PDF準備中…";
    setStatus("問題を作成中",`${CATEGORY[key].name}の問題を${count}問生成しています…`,true,false);

    try{
      const items=makeSet(key,d,count);
      await openPrintPdf(items,key,d,mode);
    }catch(err){
      console.error(err);
      els.printRoot.innerHTML="";
      els.printRoot.setAttribute("aria-hidden","true");
      setStatus("PDFを作成できませんでした",err?.message || "ページを再読み込みして、もう一度お試しください。",false,true);
    }finally{
      els.generate.disabled=false;
      els.generate.textContent=original;
    }
  }

  function setView(view){
    const training=view==="training";
    els.libraryView.hidden=training;
    els.trainingView.hidden=!training;
    els.showLibrary.classList.toggle("active",!training);
    els.showTraining.classList.toggle("active",training);
    els.showLibrary.setAttribute("aria-pressed",String(!training));
    els.showTraining.setAttribute("aria-pressed",String(training));
    if(training) window.scrollTo({top:0,behavior:"smooth"});
  }

  els.showLibrary.addEventListener("click",()=>setView("library"));
  els.showTraining.addEventListener("click",()=>setView("training"));
  els.category.addEventListener("change",updateCategoryHelp);
  els.difficulty.addEventListener("change",updateCategoryHelp);
  els.generate.addEventListener("click",generatePdf);

  updateCategoryHelp();

})();

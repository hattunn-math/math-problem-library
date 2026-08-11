(() => {
  const $ = (s) => document.querySelector(s);

  const els = {
    libraryView: $("#libraryView"),
    trainingView: $("#trainingView"),
    showLibrary: $("#showLibraryView"),
    showTraining: $("#showTrainingView"),
    category: $("#trainingCategory"),
    difficulty: $("#trainingDifficulty"),
    count: $("#trainingCount"),
    generate: $("#generateTraining"),
    regenerate: $("#regenerateTraining"),
    showAll: $("#showAllAnswers"),
    groupLabel: $("#categoryGroupLabel"),
    ruleText: $("#trainingRuleText"),
    empty: $("#trainingEmpty"),
    sheet: $("#trainingSheet"),
    title: $("#trainingTitle"),
    meta: $("#trainingMeta"),
    list: $("#generatedProblems")
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

  function question(instruction, expr, answer, signature){
    return { instruction, expr, answer, signature: signature || `${instruction}|${expr}|${answer}` };
  }

  function refreshMath(){
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([els.list]).catch(()=>{});
    }
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
    return question("次の関数を微分せよ。", `y=${expr}`,
      `y'=${polyLatex(polyDerivative(p))}`, `d2-${d}-${expr}`);
  }

  // ---------- 不定積分 数学II ----------
  function genIndef2(d){
    let expr, p;
    if(d===1){
      const anti=randomPoly(randInt(2,4),4,true);
      p=polyDerivative(anti);
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
    const anti=polyIntegrate(p);
    return question("次の不定積分を求めよ。", `\\int \\left(${expr}\\right)\\,dx`,
      withC(polyLatex(anti)), `i2-${d}-${expr}`);
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
    const anti=polyIntegrate(p);
    const value=polyEval(anti,hi).sub(polyEval(anti,lo));
    return question("次の定積分を求めよ。", `\\int_{${lo}}^{${hi}} \\left(${expr}\\right)\\,dx`,
      ratLatex(value), `di2-${d}-${expr}-${lo}-${hi}`);
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

  function generateSet(){
    const key=els.category.value;
    const d=Number(els.difficulty.value);
    const count=Number(els.count.value);
    const gen=GENERATORS[key];

    const items=[];
    const signatures=new Set();
    let attempts=0;
    while(items.length<count && attempts<count*40){
      attempts++;
      const item=gen(d);
      if(!signatures.has(item.signature)){
        signatures.add(item.signature);
        items.push(item);
      }
    }

    // In very small finite template pools, allow repeats only if needed.
    while(items.length<count){
      items.push(gen(d));
    }

    els.empty.hidden=true;
    els.sheet.hidden=false;
    els.title.textContent=CATEGORY[key].name;
    els.meta.textContent=`${CATEGORY[key].group} ／ ${DIFFICULTY[d]} ／ ${count}問`;
    els.showAll.textContent="すべての答えを表示";
    els.showAll.dataset.open="false";

    els.list.innerHTML=items.map((item,i)=>`
      <article class="generated-problem-card">
        <div class="generated-number">${i+1}</div>
        <div class="generated-body">
          <p class="generated-instruction">${item.instruction}</p>
          <div class="generated-expression">\\[${item.expr}\\]</div>
          <button class="answer-toggle" type="button" data-answer-toggle="${i}" aria-expanded="false">
            答えを見る
          </button>
          <div class="generated-answer" data-answer="${i}" hidden>
            <span class="answer-label">答</span>
            <div>\\[${item.answer}\\]</div>
          </div>
        </div>
      </article>
    `).join("");

    refreshMath();
    els.sheet.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function setView(view){
    const training=view==="training";
    els.libraryView.hidden=training;
    els.trainingView.hidden=!training;
    els.showLibrary.classList.toggle("active",!training);
    els.showTraining.classList.toggle("active",training);
    els.showLibrary.setAttribute("aria-pressed",String(!training));
    els.showTraining.setAttribute("aria-pressed",String(training));
    if(training) {
      window.scrollTo({top:0,behavior:"smooth"});
      setTimeout(()=>window.MathJax?.typesetPromise?.([els.trainingView]),50);
    }
  }

  els.showLibrary.addEventListener("click",()=>setView("library"));
  els.showTraining.addEventListener("click",()=>setView("training"));
  els.category.addEventListener("change",updateCategoryHelp);
  els.difficulty.addEventListener("change",updateCategoryHelp);
  els.generate.addEventListener("click",generateSet);
  els.regenerate.addEventListener("click",generateSet);

  els.list.addEventListener("click",(e)=>{
    const btn=e.target.closest("[data-answer-toggle]");
    if(!btn) return;
    const id=btn.dataset.answerToggle;
    const answer=els.list.querySelector(`[data-answer="${id}"]`);
    const opening=answer.hidden;
    answer.hidden=!opening;
    btn.textContent=opening?"答えを隠す":"答えを見る";
    btn.setAttribute("aria-expanded",String(opening));
    if(opening) window.MathJax?.typesetPromise?.([answer]);
  });

  els.showAll.addEventListener("click",()=>{
    const opening=els.showAll.dataset.open!=="true";
    els.showAll.dataset.open=String(opening);
    els.showAll.textContent=opening?"すべての答えを隠す":"すべての答えを表示";
    els.list.querySelectorAll("[data-answer]").forEach(x=>x.hidden=!opening);
    els.list.querySelectorAll("[data-answer-toggle]").forEach(x=>{
      x.textContent=opening?"答えを隠す":"答えを見る";
      x.setAttribute("aria-expanded",String(opening));
    });
    if(opening) window.MathJax?.typesetPromise?.([els.list]);
  });

  updateCategoryHelp();
})();
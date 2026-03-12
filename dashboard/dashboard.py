import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import networkx as nx
import time
from datetime import datetime

from scanner.scan_engine import run_scan, get_all_endpoints, get_scan_history

st.set_page_config(
    page_title="Zombie API Defence Platform",
    page_icon="🔐",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap');
html, body, [class*="css"] { font-family: 'Syne', sans-serif !important; background-color: #080c10 !important; color: #e6edf3 !important; }
.stApp { background-color: #080c10 !important; }
[data-testid="stSidebar"] { background: linear-gradient(180deg,#0d1117 0%,#080c10 100%) !important; border-right: 1px solid #21262d !important; }
.metric-card { background:#161b22; border:1px solid #21262d; border-radius:8px; padding:20px 24px; position:relative; overflow:hidden; margin-bottom:8px; }
.metric-card::before { content:''; position:absolute; top:0;left:0;right:0; height:2px; }
.metric-card.green::before { background:#00ff9d; }
.metric-card.red::before { background:#ff4560; }
.metric-card.orange::before { background:#ff9f43; }
.metric-card.blue::before { background:#00b4d8; }
.metric-label { font-size:11px; letter-spacing:2px; color:#7d8590; text-transform:uppercase; font-family:'JetBrains Mono',monospace !important; }
.metric-value { font-size:40px; font-weight:800; line-height:1.1; margin:6px 0 4px; }
.metric-sub { font-size:12px; color:#7d8590; font-family:'JetBrains Mono',monospace !important; }
.green .metric-value { color:#00ff9d; } .red .metric-value { color:#ff4560; } .orange .metric-value { color:#ff9f43; } .blue .metric-value { color:#00b4d8; }
.zombie-alert { background:rgba(255,69,96,0.08); border:1px solid rgba(255,69,96,0.35); border-left:3px solid #ff4560; border-radius:6px; padding:14px 18px; margin-bottom:10px; font-family:'JetBrains Mono',monospace !important; font-size:13px; }
.shadow-alert { background:rgba(255,159,67,0.08); border:1px solid rgba(255,159,67,0.35); border-left:3px solid #ff9f43; border-radius:6px; padding:14px 18px; margin-bottom:10px; font-family:'JetBrains Mono',monospace !important; font-size:13px; }
.new-alert { background:rgba(168,85,247,0.08); border:1px solid rgba(168,85,247,0.35); border-left:3px solid #a855f7; border-radius:6px; padding:14px 18px; margin-bottom:10px; font-family:'JetBrains Mono',monospace !important; font-size:13px; }
.section-header { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#7d8590; font-family:'JetBrains Mono',monospace !important; margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid #21262d; }
.scan-log { background:#0d1117; border:1px solid #21262d; border-radius:6px; padding:14px 16px; font-family:'JetBrains Mono',monospace !important; font-size:12px; color:#00ff9d; max-height:160px; overflow-y:auto; margin-bottom:16px; }
.stButton > button { background:transparent !important; border:1px solid #00ff9d !important; color:#00ff9d !important; font-family:'JetBrains Mono',monospace !important; font-size:13px !important; letter-spacing:1px !important; padding:8px 20px !important; border-radius:4px !important; }
#MainMenu, footer, header { visibility:hidden; }
.block-container { padding-top:1.5rem !important; }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #21262d;">
  <div style="font-size:28px;">🔐</div>
  <div>
    <div style="font-size:22px;font-weight:800;color:#e6edf3;letter-spacing:-0.5px;">ZOMBIE API DEFENCE PLATFORM</div>
    <div style="font-size:11px;color:#7d8590;letter-spacing:3px;font-family:'JetBrains Mono',monospace;">API DISCOVERY · ZOMBIE DETECTION · CONTINUOUS MONITORING</div>
  </div>
  <div style="margin-left:auto;text-align:right;">
    <div style="font-size:11px;color:#7d8590;font-family:'JetBrains Mono',monospace;">SYSTEM STATUS</div>
    <div style="font-size:13px;color:#00ff9d;font-family:'JetBrains Mono',monospace;">● OPERATIONAL</div>
  </div>
</div>
""", unsafe_allow_html=True)

with st.sidebar:
    st.markdown('<div class="section-header">⚙ SCAN CONTROL PANEL</div>', unsafe_allow_html=True)
    target_url = st.text_input("Target API URL", value="http://localhost:8000")
    log_file = st.selectbox("Select Log File", ["logs_test1.json","logs_test2.json","logs_test3.json"])
    st.markdown("""<div style="font-size:11px;color:#7d8590;margin-bottom:12px;line-height:1.8;font-family:'JetBrains Mono',monospace;">
    📊 Test 1 — Normal traffic<br>⚠️ Test 2 — APIs going inactive<br>🆕 Test 3 — New API detected</div>""", unsafe_allow_html=True)
    col1, col2 = st.columns(2)
    scan_clicked = col1.button("▶ START SCAN", use_container_width=True)
    refresh_clicked = col2.button("↻ REFRESH", use_container_width=True)
    auto_scan = st.toggle("🔄 Auto-Scan (30s)", value=False)
    st.markdown("---")
    st.markdown('<div class="section-header">📋 SCAN HISTORY</div>', unsafe_allow_html=True)
    history = get_scan_history()
    if history:
        for h in history[:5]:
            ts = h["timestamp"][:16].replace("T"," ")
            st.markdown(f"""<div style="background:#161b22;border:1px solid #21262d;border-radius:4px;padding:8px 10px;margin-bottom:6px;font-family:'JetBrains Mono',monospace;font-size:11px;">
            <span style="color:#00ff9d;">#{h['scan_id']}</span> · <span style="color:#7d8590;">{ts}</span><br>
            <span style="color:#e6edf3;">{h['log_file']}</span> · <span style="color:#ff4560;">🧟{h['zombie_count']}</span> · <span style="color:#ff9f43;">👻{h['shadow_count']}</span>
            </div>""", unsafe_allow_html=True)
    else:
        st.markdown('<div style="font-size:12px;color:#7d8590;font-family:\'JetBrains Mono\',monospace;">No scans yet</div>', unsafe_allow_html=True)
    st.markdown("---")
    st.markdown('<div style="font-size:10px;color:#444;font-family:\'JetBrains Mono\',monospace;text-align:center;">v1.0.0 · ZOMBIE API PLATFORM</div>', unsafe_allow_html=True)

if "scan_result" not in st.session_state: st.session_state.scan_result = None
if "scan_log" not in st.session_state: st.session_state.scan_log = []
if "last_auto" not in st.session_state: st.session_state.last_auto = 0

def do_scan():
    with st.spinner("🔍 Scanning target..."):
        logs = [f"[{datetime.now().strftime('%H:%M:%S')}] Initiating scan → {target_url}",
                f"[{datetime.now().strftime('%H:%M:%S')}] Fetching OpenAPI specification..."]
        result = run_scan(target_url, log_file)
        if "error" in result:
            logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] ✗ ERROR: {result['error']}")
            st.error(f"Scan failed: {result['error']}\n\nStart the API server:\n  cd zombie-api-platform\n  uvicorn backend.api_server:app --port 8000")
        else:
            logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] ✓ Discovered {result['total_apis']} endpoints")
            logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] Active:{result['active_count']}  Zombie:{result['zombie_count']}  Shadow:{result['shadow_count']}  Deprecated:{result['deprecated_count']}")
            if result["new_apis_detected"]: logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] ⚡ NEW APIs: {result['new_apis_detected']}")
            logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] ✓ Scan #{result['scan_id']} complete")
            st.session_state.scan_result = result
        st.session_state.scan_log = logs

if scan_clicked: do_scan()
if refresh_clicked and st.session_state.scan_result: do_scan()
if auto_scan:
    now = time.time()
    if now - st.session_state.last_auto > 30:
        st.session_state.last_auto = now
        do_scan(); st.rerun()

endpoints = get_all_endpoints()

if st.session_state.scan_log:
    st.markdown('<div class="scan-log">' + "<br>".join(st.session_state.scan_log) + '</div>', unsafe_allow_html=True)

STATUS_COLORS = {"active":"#00ff9d","zombie":"#ff4560","shadow":"#ff9f43","deprecated":"#ffd32a"}
RISK_COLORS = {"Critical":"#ff4560","High":"#ff6b35","Medium":"#ffd32a","Low":"#00ff9d"}

if endpoints:
    df = pd.DataFrame(endpoints)
    total=len(df); active=len(df[df.status=="active"]); zombie=len(df[df.status=="zombie"])
    shadow=len(df[df.status=="shadow"]); deprecated=len(df[df.status=="deprecated"])

    c1,c2,c3,c4,c5 = st.columns(5)
    cards = [
        (c1,"blue","Total APIs",total,"Discovered"),
        (c2,"green","Active",active,"Healthy traffic"),
        (c3,"red","🧟 Zombie",zombie,"Zero traffic"),
        (c4,"orange","👻 Shadow",shadow,"Undocumented"),
        (c5,"orange","⚠ Deprecated",deprecated,"Low traffic"),
    ]
    for col,cls,lbl,val,sub in cards:
        with col:
            st.markdown(f'<div class="metric-card {cls}"><div class="metric-label">{lbl}</div><div class="metric-value">{val}</div><div class="metric-sub">{sub}</div></div>', unsafe_allow_html=True)

    st.markdown("")
    left, right = st.columns([3,2])

    with left:
        st.markdown('<div class="section-header">📋 API INVENTORY</div>', unsafe_allow_html=True)
        disp = df[["endpoint","method","traffic_count","status","risk_level","recommendation"]].copy()
        disp.columns = ["Endpoint","Method","Traffic","Status","Risk","Recommendation"]
        def color_row(row):
            c = STATUS_COLORS.get(row["Status"],"#7d8590")
            return [f"color:{c}"]*len(row)
        st.dataframe(disp.style.apply(color_row,axis=1),width="stretch",height=300)

        st.markdown("")
        st.markdown('<div class="section-header">🕸 API DEPENDENCY GRAPH</div>', unsafe_allow_html=True)
        G = nx.DiGraph()
        G.add_node("API Gateway")
        for _,row in df.iterrows():
            G.add_node(row["endpoint"])
            if row["status"] not in ["zombie","shadow"]:
                G.add_edge("API Gateway", row["endpoint"])
        pos = nx.spring_layout(G, seed=42, k=2.5)
        ex,ey = [],[]
        for u,v in G.edges():
            x0,y0=pos[u]; x1,y1=pos[v]
            ex+=[x0,x1,None]; ey+=[y0,y1,None]
        nc,ns = [],[]
        for node in G.nodes():
            if node=="API Gateway": nc.append("#00b4d8"); ns.append(20)
            else:
                s = df[df.endpoint==node]["status"].values
                nc.append(STATUS_COLORS.get(s[0] if len(s) else "unknown","#7d8590")); ns.append(14)
        fig_g = go.Figure()
        fig_g.add_trace(go.Scatter(x=ex,y=ey,mode="lines",line=dict(width=1,color="#21262d"),hoverinfo="none"))
        fig_g.add_trace(go.Scatter(x=[pos[n][0] for n in G.nodes()],y=[pos[n][1] for n in G.nodes()],
            mode="markers+text",marker=dict(size=ns,color=nc,line=dict(width=1,color="#080c10")),
            text=[n.split("/")[-1] or n for n in G.nodes()],textposition="top center",
            textfont=dict(size=9,color="#7d8590",family="JetBrains Mono"),hovertext=list(G.nodes()),hoverinfo="text"))
        fig_g.update_layout(paper_bgcolor="#0d1117",plot_bgcolor="#0d1117",margin=dict(l=10,r=10,t=10,b=10),
            showlegend=False,height=250,xaxis=dict(showgrid=False,zeroline=False,showticklabels=False),
            yaxis=dict(showgrid=False,zeroline=False,showticklabels=False))
        st.plotly_chart(fig_g, use_container_width=True)

    with right:
        st.markdown('<div class="section-header">📊 STATUS DISTRIBUTION</div>', unsafe_allow_html=True)
        sc = df.status.value_counts().reset_index(); sc.columns=["status","count"]
        fig_pie = go.Figure(go.Pie(labels=sc.status.str.capitalize(),values=sc["count"],hole=0.55,
            marker=dict(colors=[STATUS_COLORS.get(s,"#7d8590") for s in sc.status],line=dict(color="#080c10",width=2)),
            textfont=dict(family="JetBrains Mono",size=11)))
        fig_pie.update_layout(paper_bgcolor="#0d1117",plot_bgcolor="#0d1117",font=dict(color="#7d8590"),
            legend=dict(font=dict(family="JetBrains Mono",size=11),bgcolor="rgba(0,0,0,0)"),
            margin=dict(l=10,r=10,t=10,b=10),height=210)
        st.plotly_chart(fig_pie, use_container_width=True)

        st.markdown('<div class="section-header">📈 RISK BREAKDOWN</div>', unsafe_allow_html=True)
        rc = df.risk_level.value_counts().reset_index(); rc.columns=["risk_level","count"]
        fig_bar = go.Figure(go.Bar(x=rc.risk_level,y=rc["count"],
            marker=dict(color=[RISK_COLORS.get(r,"#7d8590") for r in rc.risk_level],line=dict(color="#080c10",width=1)),
            text=rc["count"],textposition="outside",textfont=dict(family="JetBrains Mono",size=12,color="#e6edf3")))
        fig_bar.update_layout(paper_bgcolor="#0d1117",plot_bgcolor="#0d1117",font=dict(color="#7d8590",family="JetBrains Mono"),
            xaxis=dict(showgrid=False,tickfont=dict(family="JetBrains Mono",size=11)),
            yaxis=dict(showgrid=True,gridcolor="#161b22",tickfont=dict(family="JetBrains Mono",size=11)),
            margin=dict(l=10,r=10,t=20,b=10),height=190)
        st.plotly_chart(fig_bar, use_container_width=True)

        st.markdown('<div class="section-header">📡 TRAFFIC VOLUMES</div>', unsafe_allow_html=True)
        dft = df.sort_values("traffic_count",ascending=True)
        fig_t = go.Figure(go.Bar(x=dft.traffic_count,y=[e.split("/")[-1] or e for e in dft.endpoint],
            orientation="h",marker=dict(color=[STATUS_COLORS.get(s,"#7d8590") for s in dft.status],line=dict(color="#080c10",width=1)),
            text=dft.traffic_count,textposition="outside",textfont=dict(family="JetBrains Mono",size=10,color="#7d8590")))
        fig_t.update_layout(paper_bgcolor="#0d1117",plot_bgcolor="#0d1117",font=dict(color="#7d8590",family="JetBrains Mono"),
            xaxis=dict(showgrid=True,gridcolor="#161b22",tickfont=dict(family="JetBrains Mono",size=10)),
            yaxis=dict(showgrid=False,tickfont=dict(family="JetBrains Mono",size=10)),
            margin=dict(l=10,r=10,t=10,b=10),height=230)
        st.plotly_chart(fig_t, use_container_width=True)

    st.markdown("")
    st.markdown('<div class="section-header">🚨 SECURITY ALERTS</div>', unsafe_allow_html=True)
    a1,a2,a3 = st.columns(3)

    with a1:
        zdf = df[df.status=="zombie"]
        if len(zdf):
            for _,row in zdf.iterrows():
                st.markdown(f"""<div class="zombie-alert"><span style="color:#ff4560;font-weight:700;">🧟 ZOMBIE API DETECTED</span><br>
                <span style="color:#7d8590;">Endpoint:</span> <span style="color:#e6edf3;">{row.endpoint}</span><br>
                <span style="color:#7d8590;">Traffic:</span> <span style="color:#ff4560;">0 requests</span><br>
                <span style="color:#7d8590;">Risk:</span> <span style="color:#ff4560;">{row.risk_level}</span><br>
                <span style="color:#7d8590;">Action:</span> Decommission immediately</div>""", unsafe_allow_html=True)
        else:
            st.markdown('<div style="color:#7d8590;font-size:12px;font-family:\'JetBrains Mono\',monospace;">✓ No zombie APIs detected</div>', unsafe_allow_html=True)

    with a2:
        sdf = df[df.status=="shadow"]
        if len(sdf):
            for _,row in sdf.iterrows():
                st.markdown(f"""<div class="shadow-alert"><span style="color:#ff9f43;font-weight:700;">👻 SHADOW API DETECTED</span><br>
                <span style="color:#7d8590;">Endpoint:</span> <span style="color:#e6edf3;">{row.endpoint}</span><br>
                <span style="color:#7d8590;">Exposure:</span> <span style="color:#ff9f43;">Internal route exposed</span><br>
                <span style="color:#7d8590;">Risk:</span> <span style="color:#ff9f43;">{row.risk_level}</span><br>
                <span style="color:#7d8590;">Action:</span> Restrict access now</div>""", unsafe_allow_html=True)
        else:
            st.markdown('<div style="color:#7d8590;font-size:12px;font-family:\'JetBrains Mono\',monospace;">✓ No shadow APIs detected</div>', unsafe_allow_html=True)

    with a3:
        result = st.session_state.scan_result
        new_found = [e for e in (result.get("endpoints",[]) if result else []) if e.get("is_new",False)]
        if new_found:
            for ep in new_found:
                st.markdown(f"""<div class="new-alert"><span style="color:#a855f7;font-weight:700;">⚡ NEW API DETECTED</span><br>
                <span style="color:#7d8590;">Endpoint:</span> <span style="color:#e6edf3;">{ep['endpoint']}</span><br>
                <span style="color:#7d8590;">Method:</span> <span style="color:#a855f7;">{ep['method']}</span><br>
                <span style="color:#7d8590;">Status:</span> {ep['status'].capitalize()}<br>
                <span style="color:#7d8590;">Action:</span> Verify and register</div>""", unsafe_allow_html=True)
        else:
            st.markdown('<div style="color:#7d8590;font-size:12px;font-family:\'JetBrains Mono\',monospace;">✓ No new APIs in this scan</div>', unsafe_allow_html=True)

    st.markdown("")
    st.markdown('<div class="section-header">🎯 RISK SCORE ANALYSIS</div>', unsafe_allow_html=True)
    dr = df[["endpoint","status","risk_level","risk_score","traffic_count"]].sort_values("risk_score",ascending=False)
    fig_rs = go.Figure(go.Bar(
        x=[e.split("/")[-1] or e for e in dr.endpoint], y=dr.risk_score,
        marker=dict(color=dr.risk_score,colorscale=[[0,"#00ff9d"],[0.4,"#ffd32a"],[0.7,"#ff9f43"],[1.0,"#ff4560"]],
            showscale=True,colorbar=dict(tickfont=dict(family="JetBrains Mono",size=10,color="#7d8590"),
            title=dict(text="Score",font=dict(family="JetBrains Mono",size=10,color="#7d8590")))),
        text=dr.risk_score.round(1),textposition="outside",textfont=dict(family="JetBrains Mono",size=11,color="#e6edf3")))
    fig_rs.update_layout(paper_bgcolor="#0d1117",plot_bgcolor="#0d1117",font=dict(color="#7d8590",family="JetBrains Mono"),
        xaxis=dict(showgrid=False,tickfont=dict(family="JetBrains Mono",size=10,color="#7d8590"),tickangle=-30),
        yaxis=dict(showgrid=True,gridcolor="#161b22",tickfont=dict(family="JetBrains Mono",size=10,color="#7d8590"),range=[0,120]),
        margin=dict(l=10,r=10,t=20,b=60),height=280)
    st.plotly_chart(fig_rs, use_container_width=True)

else:
    st.markdown("""
    <div style="text-align:center;padding:80px 20px;background:#0d1117;border:1px solid #21262d;border-radius:8px;">
      <div style="font-size:48px;margin-bottom:16px;">🔍</div>
      <div style="font-size:18px;font-weight:700;color:#e6edf3;margin-bottom:8px;">No scan data available</div>
      <div style="font-size:13px;color:#7d8590;font-family:'JetBrains Mono',monospace;margin-bottom:24px;">Start the API server, then click START SCAN in the sidebar</div>
      <div style="background:#161b22;border:1px solid #21262d;border-radius:6px;padding:16px 24px;display:inline-block;text-align:left;">
        <div style="font-size:11px;color:#7d8590;font-family:'JetBrains Mono',monospace;margin-bottom:8px;">QUICK START</div>
        <div style="font-size:12px;color:#00ff9d;font-family:'JetBrains Mono',monospace;line-height:2.2;">
        $ uvicorn backend.api_server:app --port 8000<br>
        $ streamlit run dashboard/dashboard.py
        </div>
      </div>
    </div>""", unsafe_allow_html=True)

if auto_scan:
    time.sleep(1); st.rerun()
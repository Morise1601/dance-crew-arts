"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { flushSync } from "react-dom";
import { ArrowDown, ArrowLeft, ArrowRight, Camera, Check, Film, ImageOff, Maximize2, Play, RefreshCw, Sparkles, Volume2, X } from "lucide-react";
import { ShowcaseCategoryIcon } from "@/components/showcase/category-icon";
import { playVideoWithFallback, type VideoPlaybackResult } from "@/components/showcase/video-playback";
import { buildShowcaseCategoryHref, type ShowcaseCollection } from "@/lib/showcase/categories";
import type { ShowcaseMedia } from "@/lib/showcase/types";
import styles from "./showcase.module.css";

type MediaFilter = "all" | "image" | "video";
type PlaybackState = VideoPlaybackResult | "starting" | "idle";

const artworkLabels = ["Sound & soul", "Made to move", "Own the spotlight", "Strength in motion", "Find the rhythm", "Beyond the ordinary", "Rooted in grace", "Born to shine"];
const artworkIcons = ["music", "sparkles", "drama", "shield", "drum", "cloud", "flower", "star"];

/** Original, lightweight artwork gives unpublished collections a visual identity. */
function CategoryArtwork({ icon, index = 0 }: { icon: string; index?: number }) {
  const iconIndex = artworkIcons.indexOf(icon);
  const variant = iconIndex < 0 || icon === "sparkles" ? (index + 1) % artworkLabels.length : iconIndex;
  return (
    <span className={`${styles.categoryArtwork} ${styles[`artwork${variant}`]}`} aria-hidden="true">
      <span className={styles.artworkGrain} />
      <svg viewBox="0 0 400 340" fill="none" className={styles.artworkDrawing}>
        {variant === 0 && <>
          <circle cx="245" cy="157" r="127" className={styles.artworkDisc} />
          <circle cx="245" cy="157" r="102" /><circle cx="245" cy="157" r="81" /><circle cx="245" cy="157" r="26" className={styles.artworkSolid} /><circle cx="245" cy="157" r="5" className={styles.artworkDark} />
          <path d="M22 263v-29m14 50v-69m14 93V190m14 88v-48m14 72V204m14 123V168m14 115v-59m14 87V196m14 87v-59m14 70v-80" className={styles.artworkBold} />
          <path d="M330 29h43v100l-40 29" className={styles.artworkBold} />
        </>}
        {variant === 1 && <>
          <circle cx="222" cy="151" r="122" /><circle cx="222" cy="151" r="99" strokeDasharray="2 12" />
          <path d="M39 299c69-122 169-33 297-207M22 231c131-93 188 8 349-94" className={styles.artworkRibbon} />
          <circle cx="219" cy="82" r="15" className={styles.artworkSolid} />
          <path d="m214 110-29 63 45 29 18 78m-55-118-63-17-25-42m89 70-40 53-58 31m99-125 43-18 43-50" className={styles.artworkFigure} />
          <path d="m60 74 7-18 7 18 19 7-19 7-7 18-7-18-18-7Z" className={styles.artworkSolid} />
        </>}
        {variant === 2 && <>
          <path d="M48 0h304v340H48Z" className={styles.artworkDisc} />
          <path d="M49 0c100 72 88 190 0 216M351 0c-100 72-88 190 0 216M50 3l55 246M350 3l-55 246" className={styles.artworkRibbon} />
          <path d="m200 6-103 282h206Z" className={styles.artworkLight} />
          <path d="M126 118c29 25 61 28 93 8l-3 66c-2 43-58 49-77 7Z" className={styles.artworkDisc} />
          <path d="m146 151 15 4m27 2 15-3m-48 31c14 16 28 14 39-2" className={styles.artworkBold} />
          <path d="M215 99c29-9 52-22 64-40l19 60c12 41-34 65-66 33Z" className={styles.artworkDisc} />
          <path d="m235 112 13-5m19-15 12-6m-31 49c4-16 14-23 28-22" className={styles.artworkBold} />
          <ellipse cx="201" cy="300" rx="126" ry="14" />
        </>}
        {variant === 3 && <>
          <circle cx="205" cy="154" r="113" className={styles.artworkDisc} /><circle cx="205" cy="154" r="135" strokeDasharray="120 18 4 18" className={styles.artworkBold} />
          <path d="m63 274 271-227M82 292 353 65" className={styles.artworkRibbon} />
          <circle cx="202" cy="88" r="16" className={styles.artworkSolid} />
          <path d="m198 120-24 60 45 26 65 61m-103-99-45-20-35 33m96-49 47 3 40-34m-84 103-47 62-35 10" className={styles.artworkFigure} />
          <path d="M39 43v37h37m284 218v-37h-37" className={styles.artworkBold} />
        </>}
        {variant === 4 && <>
          <path d="M35 210c61-207 274-173 331 3M17 222c71-256 309-222 367 5" className={styles.artworkRibbon} />
          <ellipse cx="205" cy="152" rx="100" ry="48" className={styles.artworkDisc} />
          <path d="m105 152 17 109c49 46 118 46 166 0l17-109" className={styles.artworkDisc} />
          <ellipse cx="205" cy="152" rx="86" ry="34" /><path d="m122 170 36 111 31-83 39 91 29-92 31 64" />
          <path d="m106 49 89 92m107-97-87 102" className={styles.artworkFigure} />
          <path d="M47 243v42m-14-30h28m274-152v34m-13-22h27" className={styles.artworkBold} />
        </>}
        {variant === 5 && <>
          <circle cx="269" cy="105" r="63" className={styles.artworkSolid} /><circle cx="269" cy="105" r="82" />
          <path d="M-20 256c79-134 134 70 221-40s129-83 223 3v140H-20Z" className={styles.artworkDisc} />
          <path d="M-20 289c92-134 130 52 220-34s144-68 220-6M-20 318c94-119 138 28 224-30s136-53 216-16" className={styles.artworkRibbon} />
          <path d="M45 110c14-32 38-32 49 0 11-32 35-32 49 0M74 66l11-17 12 17" className={styles.artworkBold} />
          <circle cx="87" cy="184" r="5" className={styles.artworkSolid} /><circle cx="168" cy="102" r="3" className={styles.artworkSolid} />
        </>}
        {variant === 6 && <>
          <circle cx="204" cy="165" r="121" /><circle cx="204" cy="165" r="142" strokeDasharray="2 10" />
          <path d="M204 260c-55-50-58-117 0-184 58 67 55 134 0 184Z" className={styles.artworkDisc} />
          <path d="M204 260c-76-10-117-61-109-148 84 21 122 76 109 148Z" className={styles.artworkDisc} />
          <path d="M204 260c76-10 117-61 109-148-84 21-122 76-109 148Z" className={styles.artworkDisc} />
          <path d="M204 260c-81 23-139-4-163-84 89-11 142 18 163 84Zm0 0c81 23 139-4 163-84-89-11-142 18-163 84Z" className={styles.artworkDisc} />
          <path d="M204 260V102m0 158-92-128m92 128 92-128m-92 128L62 187m142 73 142-73" />
          <path d="M155 288h98m-76 13h54" className={styles.artworkBold} />
        </>}
        {variant === 7 && <>
          <path d="m202 31 31 88 94-1-75 57 30 90-80-54-80 54 30-90-75-57 94 1Z" className={styles.artworkDisc} />
          <circle cx="202" cy="158" r="130" /><circle cx="202" cy="158" r="148" strokeDasharray="2 18" />
          <path d="m202 65 24 69h73l-59 43 22 69-60-42-60 42 22-69-59-43h73Z" />
          <path d="M202 0v18m0 279v25M40 158h-23m370 0h-23M55 37l21 20m255 204 20 20M349 37l-21 20M75 261l-20 20" className={styles.artworkBold} />
        </>}
      </svg>
      <span className={styles.artworkEmblem}><ShowcaseCategoryIcon name={icon} /></span>
      <span className={styles.artworkLabel}>{artworkLabels[variant]}</span>
      <span className={styles.artworkEdition}>D&apos;ART / COLLECTION {String(index + 1).padStart(2, "0")}</span>
    </span>
  );
}

function MediaImage({ item, full = false, decorative = false, fallback }: { item: ShowcaseMedia; full?: boolean; decorative?: boolean; fallback?: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) return fallback ?? <span className={styles.imageFallback} role="status"><ImageOff size={30} strokeWidth={1.3} aria-hidden="true" /><span>This photograph couldn&apos;t load.</span></span>;

  return <>
    {!loaded && <span className={styles.imageSkeleton} aria-hidden="true" />}
    <Image src={item.url} alt={decorative ? "" : item.description || item.name} fill unoptimized
      sizes={full ? "(max-width: 1100px) 95vw, 1080px" : "(max-width: 600px) 100vw, (max-width: 1120px) 50vw, 33vw"}
      className={`${full ? styles.fullImage : styles.cardImage} ${loaded ? styles.imageLoaded : ""}`}
      onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
  </>;
}

function pausePreview(video: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
  if (video.readyState >= 1) {
    try { video.currentTime = Math.min(.1, video.duration || .1); } catch { /* A pending metadata request can make seeking unavailable. */ }
  }
}

/** Attach sources only near the viewport; previews never open the media viewer. */
function VideoPreview({ item, fallback }: { item: ShowcaseMedia; fallback: ReactNode }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastVideoRef = useRef<HTMLVideoElement>(null);
  const setVideoRef = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (video) lastVideoRef.current = video;
  }, []);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let observer: IntersectionObserver | undefined;
    let frame: number | undefined;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
        else pausePreview(videoRef.current);
      }, { rootMargin: "140px" });
      observer.observe(container);
    } else {
      frame = requestAnimationFrame(() => setShouldLoad(true));
    }
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => pausePreview(videoRef.current ?? lastVideoRef.current);
    const onVisibility = () => { if (document.hidden) stop(); };
    const onMotion = () => { if (motion.matches) stop(); };
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    return () => {
      observer?.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
      stop();
    };
  }, []);

  return (
    <span ref={containerRef} className={styles.previewShell}
      onPointerEnter={(event) => {
        if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const playback = videoRef.current?.play();
        playback?.catch(() => { /* The loaded frame remains a usable preview if autoplay is unavailable. */ });
      }}
      onPointerLeave={() => pausePreview(videoRef.current)}>
      {fallback}
      {shouldLoad && !failed && <video ref={setVideoRef} data-showcase-preview src={`${item.url.split("#")[0]}#t=0.1`} muted playsInline loop preload="metadata" tabIndex={-1} aria-hidden="true"
        className={`${styles.previewVideo} ${ready ? styles.previewReady : ""}`}
        onLoadedData={() => setReady(true)} onError={() => setFailed(true)} />}
      <span className={styles.previewShade} aria-hidden="true" />
    </span>
  );
}

function MediaViewer({ item, videoRef, playback, onClose, onPlay, onUnmute }: {
  item: ShowcaseMedia; videoRef: RefObject<HTMLVideoElement | null>; playback: PlaybackState;
  onClose: () => void; onPlay: () => void; onUnmute: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const headingId = useId();
  const descriptionId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      video?.pause();
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [videoRef]);

  return (
    <dialog ref={dialogRef} className={styles.viewer} aria-labelledby={headingId} aria-describedby={item.description ? descriptionId : undefined}
      onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={styles.viewerInner}>
        <div className={styles.viewerHeader}>
          <div className={styles.viewerHeading}><span className={styles.eyebrow}>{item.media_type === "video" ? "The performance" : "The photograph"}</span><h2 id={headingId}>{item.name}</h2></div>
          <button ref={closeRef} type="button" className={styles.closeButton} onClick={onClose} aria-label="Close media viewer"><X size={22} aria-hidden="true" /></button>
        </div>
        <div className={`${styles.viewerMedia} ${item.media_type === "video" ? styles.viewerVideo : ""}`}>
          {item.media_type === "image" ? <MediaImage item={item} full /> : videoFailed ? <div className={styles.imageFallback} role="status"><Film size={32} strokeWidth={1.3} aria-hidden="true" /><span>This video couldn&apos;t load. Please try again later.</span></div> :
            <video ref={videoRef} src={item.url} controls playsInline preload="auto" className={styles.videoPlayer} aria-label={item.name} onError={() => setVideoFailed(true)}>Your browser does not support video playback.</video>}
        </div>
        {item.media_type === "video" && !videoFailed && <div className={styles.playbackBar} aria-live="polite">
          {playback === "starting" && <span>Starting the performance…</span>}
          {playback === "muted" && <><span>Playing with sound off</span><button type="button" onClick={onUnmute}><Volume2 size={17} aria-hidden="true" />Turn sound on</button></>}
          {playback === "blocked" && <><span>Your browser needs one more tap.</span><button type="button" onClick={onPlay}><Play size={16} fill="currentColor" aria-hidden="true" />Play video</button></>}
          {(playback === "playing" || playback === "idle") && <span><Film size={15} aria-hidden="true" />You have the best seat in the house.</span>}
        </div>}
        {item.description && <p id={descriptionId} className={styles.viewerDescription}>{item.description}</p>}
        <p className={styles.viewerHint}>D&apos;Art Crew <span aria-hidden="true">/</span> Dance. Rhythm. Technique.</p>
      </div>
    </dialog>
  );
}

function MediaCard({ item, index, categoryIcon, onOpen }: { item: ShowcaseMedia; index: number; categoryIcon: string; onOpen: () => void }) {
  const isVideo = item.media_type === "video";
  return <button type="button" className={styles.mediaCard} onClick={onOpen} aria-label={`${isVideo ? "Watch" : "View"} ${item.name}`}>
    <span className={`${styles.mediaVisual} ${styles[`ratio${index % 3}`]} ${isVideo ? styles.videoVisual : ""}`}>
      {isVideo ? <><VideoPreview item={item} fallback={<CategoryArtwork icon={categoryIcon} index={index} />} /><span className={styles.playButton}><Play size={25} fill="currentColor" aria-hidden="true" /></span><span className={styles.videoPrompt}>Step into the performance</span></> : <MediaImage item={item} />}
      <span className={styles.mediaType}>{isVideo ? <Film size={13} aria-hidden="true" /> : <Camera size={13} aria-hidden="true" />}{isVideo ? "Film" : "Photo"}</span>
      {!isVideo && <span className={styles.expandButton}><Maximize2 size={18} aria-hidden="true" /></span>}
    </span>
    <span className={styles.mediaCaption}><span className={styles.mediaTitle}>{item.name}</span>{item.description && <span className={styles.mediaDescription}>{item.description}</span>}<span className={styles.cardAction}>{isVideo ? "Watch performance" : "View photograph"}<ArrowUpRightIcon /></span></span>
  </button>;
}

function ArrowUpRightIcon() { return <ArrowRight size={17} className={styles.diagonalArrow} aria-hidden="true" />; }

function EmptyState({ type }: { type: "error" | "missing" | "categories" | "media" }) {
  const router = useRouter();
  const messages = {
    error: ["A brief intermission.", "We couldn't load the showcase right now. Please try again in a moment."],
    missing: ["Let's find your rhythm.", "This collection is no longer available. Explore the other art forms in our showcase."],
    categories: ["The stage is being set.", "Our showcase is coming together. Check back soon for a closer look at the crew."],
    media: ["The next moment is taking shape.", "Every performance starts somewhere. We're curating this collection — come back soon to see this art form in action."],
  };
  const [title, description] = messages[type];
  return <div className={styles.emptyState} role={type === "error" ? "alert" : "status"}>
    <div className={styles.emptyIcon}><Sparkles size={29} strokeWidth={1.2} aria-hidden="true" /></div><span className={styles.emptyEyebrow}>A little anticipation</span><h2>{title}</h2><p>{description}</p>
    {type === "error" && <button type="button" className={styles.textLink} onClick={() => router.refresh()}><RefreshCw size={16} aria-hidden="true" />Try again</button>}
    {type === "missing" && <Link href="/showcase" className={styles.textLink}><ArrowLeft size={16} aria-hidden="true" />Explore all art forms</Link>}
  </div>;
}

export default function ShowcaseClient({ categories, media, categoryId, hasError }: { categories: ShowcaseCollection[]; media: ShowcaseMedia[]; categoryId: string | null; hasError: boolean }) {
  const [activeMedia, setActiveMedia] = useState<ShowcaseMedia | null>(null);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [playback, setPlayback] = useState<PlaybackState>("idle");
  const activeVideoRef = useRef<HTMLVideoElement>(null);
  const playbackController = useRef<AbortController | null>(null);
  const category = categories.find((item) => item.id === categoryId);
  const visibleMedia = filter === "all" ? media : media.filter((item) => item.media_type === filter);
  const totalMedia = categories.reduce((total, item) => total + item.media_count, 0);
  const photoCount = media.filter((item) => item.media_type === "image").length;
  const videoCount = media.filter((item) => item.media_type === "video").length;

  useEffect(() => () => playbackController.current?.abort(), []);

  const startPlayback = () => {
    const video = activeVideoRef.current;
    if (!video) return;
    playbackController.current?.abort();
    const controller = new AbortController();
    playbackController.current = controller;
    setPlayback("starting");
    void playVideoWithFallback(video, controller.signal).then((result) => {
      if (!controller.signal.aborted && activeVideoRef.current === video) setPlayback(result);
    });
  };

  const openMedia = (item: ShowcaseMedia) => {
    document.querySelectorAll<HTMLVideoElement>("video[data-showcase-preview]").forEach((video) => video.pause());
    // Commit the player before play() so a click/tap retains browser user activation.
    flushSync(() => { setActiveMedia(item); setPlayback(item.media_type === "video" ? "starting" : "idle"); });
    if (item.media_type === "video") startPlayback();
  };

  const closeMedia = () => {
    playbackController.current?.abort();
    const video = activeVideoRef.current;
    if (video) { video.pause(); video.removeAttribute("src"); video.load(); }
    setActiveMedia(null);
  };

  return <div className={styles.showcase}>
    <div className={styles.ambient} aria-hidden="true" />
    <div className={styles.container}>
      <header className={`${styles.hero} ${categoryId ? styles.collectionHero : ""}`}>
        {categoryId && <Link href="/showcase" className={styles.backLink}><ArrowLeft size={17} aria-hidden="true" />All art forms</Link>}
        <div className={styles.eyebrow}><span className={styles.eyebrowLine} />The D&apos;Art Crew showcase</div>
        <div className={styles.heroRow}>
          <div className={styles.heroCopy}>
            <h1>{categoryId ? (category?.name ?? "Our showcase") : <>Every art.<br /><span>One crew.</span></>}</h1>
            <p>{categoryId ? "The craft. The connection. The moments that stay with you. Get closer to the energy of our crew." : "A world of rhythm, expression, and possibility. Explore the art forms that move us — and find the one that moves you."}</p>
          </div>
          <div className={styles.heroAccent} aria-hidden="true">{category ? <><span className={styles.orbitOne} /><ShowcaseCategoryIcon name={category.icon} /></> : <><span className={styles.orbitOne} /><span className={styles.orbitTwo} /><span className={styles.orbitThree} /><Sparkles className={styles.heroSparkle} strokeWidth={.7} /><span className={styles.orbitDot} /><span className={styles.heroAccentLabel}>A thousand ways<br />to feel something.</span></>}</div>
        </div>
        <div className={styles.heroFooter}>
          <span>{category ? <><b>{media.length.toString().padStart(2, "0")}</b> moments in this collection</> : <><b>{categories.length.toString().padStart(2, "0")}</b> art forms <span className={styles.statDivider}>/</span> <b>{totalMedia.toString().padStart(2, "0")}</b> moments</>}</span>
          <span className={styles.exploreHint}>{categoryId ? "Discover the collection" : "Find your inspiration"}<ArrowDown size={16} aria-hidden="true" /></span>
        </div>
      </header>

      {hasError ? <EmptyState type="error" /> : categoryId && !category ? <EmptyState type="missing" /> : !categoryId ? <section className={styles.collectionsSection} aria-labelledby="collections-title">
        <div className={styles.sectionHeading}><div><span className={styles.sectionKicker}>Different forms. Shared passion.</span><h2 id="collections-title">A collection of possibilities.</h2></div><span>Choose your art form<ArrowUpRightIcon /></span></div>
        {categories.length === 0 ? <EmptyState type="categories" /> : <div className={styles.categoryGrid}>{categories.map((item, index) => {
          const fallback = <CategoryArtwork icon={item.icon} index={index} />;
          return <Link key={item.id} href={buildShowcaseCategoryHref(item.slug)} className={styles.categoryCard}>
            <span className={styles.categoryVisual}>
              {item.cover ? item.cover.media_type === "video" ? <VideoPreview item={item.cover} fallback={fallback} /> : <MediaImage item={item.cover} decorative fallback={fallback} /> : fallback}
              <span className={styles.categoryShade} aria-hidden="true" />
              <span className={styles.categoryTop}><span>{String(index + 1).padStart(2, "0")} <span className={styles.categoryTopLine} /></span><span className={styles.categoryMiniIcon}><ShowcaseCategoryIcon name={item.icon} /></span></span>
              <span className={styles.collectionBadge}>{item.cover ? <><span className={styles.smallGoldDot} />{item.media_count} {item.media_count === 1 ? "moment captured" : "moments captured"}</> : "A new story is unfolding"}</span>
            </span>
            <span className={styles.categoryBottom}><span className={styles.categoryName}>{item.name}</span><span className={styles.categoryMeta}><span>{item.media_count ? "Discover the collection" : "Explore the art form"}</span><span className={styles.categoryArrow}><ArrowUpRightIcon /></span></span></span>
          </Link>;
        })}</div>}
        <div className={styles.indexNote}><span className={styles.smallGoldDot} />Made of passion. Captured in moments.<span className={styles.noteBrand}>D&apos;ART CREW / THE SHOWCASE</span></div>
      </section> : category ? <section className={styles.collectionsSection} aria-label={`${category.name} collection`} key={category.id}>
        <nav className={styles.categoryNav} aria-label="Art form collections">{categories.map((item) => <Link key={item.id} href={buildShowcaseCategoryHref(item.slug)} aria-current={item.id === category.id ? "page" : undefined} className={styles.categoryPill}><ShowcaseCategoryIcon name={item.icon} /><span>{item.name}</span>{item.id === category.id && <Check size={15} aria-hidden="true" />}</Link>)}</nav>
        <div className={styles.galleryToolbar}><div><span className={styles.sectionKicker}>Witness the expression</span><h2>The collection <span>{String(visibleMedia.length).padStart(2, "0")}</span></h2></div><div className={styles.mediaFilters} role="group" aria-label="Filter collection media">{([{ value: "all", label: "All", count: media.length }, { value: "image", label: "Photos", count: photoCount }, { value: "video", label: "Films", count: videoCount }] as const).map((option) => <button key={option.value} type="button" aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>{option.label}<span>{option.count}</span></button>)}</div></div>
        {media.length === 0 ? <EmptyState type="media" /> : visibleMedia.length === 0 ? <div className={styles.filterEmpty} role="status"><p>No {filter === "image" ? "photographs" : "films"} in this collection yet.</p><button type="button" className={styles.textLink} onClick={() => setFilter("all")}>View all moments<ArrowRight size={16} aria-hidden="true" /></button></div> : <div className={styles.mediaGrid}>{visibleMedia.map((item, index) => <MediaCard key={item.id} item={item} index={index} categoryIcon={category.icon} onOpen={() => openMedia(item)} />)}</div>}
      </section> : null}
    </div>
    {activeMedia && <MediaViewer key={activeMedia.id} item={activeMedia} videoRef={activeVideoRef} playback={playback} onClose={closeMedia} onPlay={startPlayback} onUnmute={() => { if (activeVideoRef.current) { activeVideoRef.current.muted = false; startPlayback(); } }} />}
  </div>;
}

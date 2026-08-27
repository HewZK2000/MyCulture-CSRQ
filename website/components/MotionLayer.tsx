'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type MotionLayerProps = { children: ReactNode };

export default function MotionLayer({ children }: MotionLayerProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP((context, contextSafe) => {
    if (!root.current) return;

    const select = gsap.utils.selector(root);
    const media = gsap.matchMedia();

    media.add(
      {
        desktop: '(min-width: 941px)',
        mobile: '(max-width: 940px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (mediaContext) => {
        const { desktop, reduceMotion } = mediaContext.conditions as {
          desktop: boolean;
          mobile: boolean;
          reduceMotion: boolean;
        };

        if (reduceMotion) {
          gsap.set(select('.scroll-progress'), { scaleX: 1 });
          return;
        }

        const nav = select('.site-nav');
        const heroPieces = select(
          '.hero .venue-pill, .hero h1, .hero-subtitle, .hero-thesis, .hero .authors, .hero .author-notes, .hero .hero-actions, .benchmark-hero .venue-pill, .benchmark-overline, .benchmark-hero h1, .benchmark-hero h1 + p, .benchmark-hero .hero-actions',
        );
        const heroVisuals = select('.instrument-panel, .benchmark-orbit');

        const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        heroTimeline
          .from(nav, { y: -70, autoAlpha: 0, duration: 0.65 })
          .from(heroPieces, { y: 34, autoAlpha: 0, duration: 0.78, stagger: 0.075 }, '-=0.35')
          .from(heroVisuals, { x: desktop ? 46 : 0, y: desktop ? 0 : 30, rotation: desktop ? 1.8 : 0, scale: 0.96, autoAlpha: 0, duration: 0.95 }, '-=0.72')
          .from(select('.format-card'), { x: 34, autoAlpha: 0, duration: 0.62, stagger: 0.1 }, '-=0.58')
          .from(select('.scroll-cue'), { y: 12, autoAlpha: 0, duration: 0.45 }, '-=0.2');

        gsap.to(select('.instrument-axis span:last-child'), {
          x: 7,
          duration: 0.85,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to(select('.scroll-cue-line'), {
          scaleY: 0.35,
          transformOrigin: 'top center',
          duration: 1.15,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to(select('.scroll-progress'), {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.25,
          },
        });

        const revealTargets = select(
          '.benchmark-gateway, .section-intro, .split-heading, .culture-copy, .passport-card, .limitations-grid > div, .resource-copy, .citation-box, .schema-grid > div, .audit-card, .benchmark-cta',
        );
        revealTargets.forEach((element) => {
          gsap.from(element, {
            y: 46,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'power3.out',
            clearProps: 'transform,visibility',
            scrollTrigger: {
              trigger: element,
              start: 'top 86%',
              once: true,
            },
          });
        });

        const groups = [
          ['.feature-grid', '.feature-card'],
          ['.domain-list', '.domain-list span'],
          ['.guidance-grid', '.guidance-grid article'],
          ['.pipeline-steps', '.pipeline-steps li'],
          ['.resource-links', '.resource-links > *'],
          ['.dimension-grid', '.dimension-grid article'],
          ['.example-grid', '.example-card'],
          ['.construction-steps', '.construction-steps li'],
          ['.schema-list', '.schema-list > div'],
          ['.use-grid', '.use-grid article'],
        ];

        groups.forEach(([containerSelector, itemSelector]) => {
          const container = select(containerSelector)[0];
          const items = select(itemSelector);
          if (!container || !items.length) return;
          gsap.from(items, {
            y: 38,
            autoAlpha: 0,
            duration: 0.72,
            stagger: 0.085,
            ease: 'power3.out',
            clearProps: 'transform,visibility',
            scrollTrigger: {
              trigger: container,
              start: 'top 84%',
              once: true,
            },
          });
        });

        select('.chart-card > a, .judge-card > a, .pipeline-figure').forEach((visual) => {
          gsap.from(visual, {
            scale: 0.94,
            y: 22,
            autoAlpha: 0,
            duration: 0.95,
            ease: 'power3.out',
            transformOrigin: 'center center',
            clearProps: 'transform,visibility',
            scrollTrigger: {
              trigger: visual,
              start: 'top 88%',
              once: true,
            },
          });
        });

        select('[data-count]').forEach((element) => {
          const target = Number((element as HTMLElement).dataset.count ?? 0);
          const suffix = (element as HTMLElement).dataset.suffix ?? '';
          const decimals = Number((element as HTMLElement).dataset.decimals ?? 0);
          const counter = { value: 0 };

          gsap.to(counter, {
            value: target,
            duration: 1.55,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 92%',
              once: true,
            },
            onUpdate: () => {
              element.textContent = `${counter.value.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })}${suffix}`;
            },
          });
        });

        if (desktop) {
          select('.instrument-panel, .passport-card, .audit-card').forEach((element, index) => {
            gsap.to(element, {
              y: index % 2 === 0 ? -24 : 20,
              ease: 'none',
              scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            });
          });

          const tiltPanel = select('.instrument-panel')[0] as HTMLElement | undefined;
          if (tiltPanel && contextSafe) {
            const rotateX = gsap.quickTo(tiltPanel, 'rotationX', { duration: 0.55, ease: 'power3.out' });
            const rotateY = gsap.quickTo(tiltPanel, 'rotationY', { duration: 0.55, ease: 'power3.out' });
            const onPointerMove = contextSafe((event: PointerEvent) => {
              const bounds = tiltPanel.getBoundingClientRect();
              rotateY(((event.clientX - bounds.left) / bounds.width - 0.5) * 5);
              rotateX(-((event.clientY - bounds.top) / bounds.height - 0.5) * 5);
            });
            const onPointerLeave = contextSafe(() => {
              rotateX(0);
              rotateY(0);
            });
            tiltPanel.addEventListener('pointermove', onPointerMove);
            tiltPanel.addEventListener('pointerleave', onPointerLeave);
            context.add(() => {
              tiltPanel.removeEventListener('pointermove', onPointerMove);
              tiltPanel.removeEventListener('pointerleave', onPointerLeave);
            });
          }
        }

        const orbitItems = select('.orbit-item');
        if (orbitItems.length) {
          const orbitTween = gsap.to(orbitItems, {
            y: (index) => (index % 2 === 0 ? -11 : 11),
            rotation: (index) => (index - 1) * 1.5,
            duration: 2.1,
            stagger: 0.28,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            paused: true,
          });
          ScrollTrigger.create({
            trigger: select('.benchmark-orbit')[0],
            start: 'top bottom',
            end: 'bottom top',
            onEnter: () => orbitTween.play(),
            onEnterBack: () => orbitTween.play(),
            onLeave: () => orbitTween.pause(),
            onLeaveBack: () => orbitTween.pause(),
          });
        }

        requestAnimationFrame(() => ScrollTrigger.refresh());
      },
    );

    return () => media.revert();
  }, { scope: root });

  return (
    <div ref={root} className="motion-root">
      <div className="scroll-progress" aria-hidden="true" />
      {children}
    </div>
  );
}

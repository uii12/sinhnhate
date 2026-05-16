document.addEventListener('DOMContentLoaded', async () => {
    const cakeMain = document.getElementById('cake-main');
    const cakePivot = document.querySelector('.cake-pivot');

    let isDragging = false;
    let startX, startY;
    let currentRotX = -15;
    let currentRotY = 0;
    let isSlice = false;

    const images = [];
    for (let i = 1; i <= 20; i++) {
        images.push(`style/img/Anh (${i}).jpg`);
    }

    const updateRotation = () => {
        if (!isSlice) {
            currentRotY += 0.2;
            // Tier-specific counter-rotations only when not a slice
            const baseWalls = document.querySelector('.tier-base .tier-side-walls');
            const topPartWalls = document.querySelector('.tier-top-part .tier-side-walls');

            if (baseWalls) baseWalls.style.transform = `rotateY(${-currentRotY * 1.5}deg)`;
            if (topPartWalls) topPartWalls.style.transform = `rotateY(${currentRotY * 1.5}deg)`;
        }

        if (!isDragging) {
            cakePivot.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
        }
        requestAnimationFrame(updateRotation);
    };

    const createCylinder = (tierClass, diameter, height, numSegments, topImg, bottomImg, sideImgs) => {
        const tier = document.createElement('div');
        tier.className = `cake-tier ${tierClass}`;

        const top = document.createElement('div');
        top.className = 'tier-top';
        top.style.width = `${diameter}px`;
        top.style.height = `${diameter}px`;
        if (topImg) top.style.backgroundImage = `url('${topImg}')`;
        else top.style.backgroundColor = '#fff';
        top.style.transform = `translate(-50%, -50%) rotateX(90deg) translateZ(${height / 2}px)`;
        tier.appendChild(top);

        const bottom = document.createElement('div');
        bottom.className = 'tier-bottom';
        bottom.style.width = `${diameter}px`;
        bottom.style.height = `${diameter}px`;
        if (bottomImg) bottom.style.backgroundImage = `url('${bottomImg}')`;
        else bottom.style.backgroundColor = '#eee';
        bottom.style.transform = `translate(-50%, -50%) rotateX(-90deg) translateZ(${height / 2}px)`;
        tier.appendChild(bottom);

        const sideWalls = document.createElement('div');
        sideWalls.className = 'tier-side-walls';
        tier.appendChild(sideWalls);

        const segmentWidth = (Math.PI * diameter) / numSegments;
        const angleStep = 360 / numSegments;
        const radius = diameter / 2;

        for (let i = 0; i < numSegments; i++) {
            const segment = document.createElement('div');
            segment.className = 'tier-side-segment';
            segment.style.width = `${segmentWidth + 1}px`;
            segment.style.height = `${height}px`;
            if (sideImgs && sideImgs.length > 0) {
                segment.style.backgroundImage = `url('${sideImgs[i % sideImgs.length]}')`;
            } else {
                segment.style.backgroundColor = '#fff';
                segment.style.borderLeft = '1px solid #ddd';
            }
            const angle = i * angleStep;
            segment.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`;
            sideWalls.appendChild(segment);
        }
        return tier;
    };

    const createSliceTier = (radius, height, angle, numSegments, yOffset, topImg, bottomImg, sideImgs, innerImgLeft, innerImgRight) => {
        const tier = document.createElement('div');
        tier.className = `cake-tier slice-tier`;
        tier.style.width = `${radius * 2}px`;
        tier.style.height = `${height}px`;
        tier.style.transform = `translate(-50%, -50%) translateY(${yOffset}px)`;

        const top = document.createElement('div');
        top.className = 'tier-top';
        top.style.width = `${radius * 2}px`;
        top.style.height = `${radius * 2}px`;
        top.style.borderRadius = '0';
        if (topImg) top.style.backgroundImage = `url('${topImg}')`;
        top.style.transform = `translate(-50%, -50%) rotateX(90deg) translateZ(${height / 2}px)`;

        let topPoints = ['50% 50%'];
        const startAngle = -angle / 2;
        const step = angle / numSegments;
        for (let i = 0; i <= numSegments; i++) {
            const a = (startAngle + i * step) * Math.PI / 180;
            const x = 50 + 50 * Math.sin(a);
            const y = 50 + 50 * Math.cos(a);
            topPoints.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
        }
        top.style.clipPath = `polygon(${topPoints.join(', ')})`;
        tier.appendChild(top);

        const bottom = document.createElement('div');
        bottom.className = 'tier-bottom';
        bottom.style.width = `${radius * 2}px`;
        bottom.style.height = `${radius * 2}px`;
        bottom.style.borderRadius = '0';
        if (bottomImg) bottom.style.backgroundImage = `url('${bottomImg}')`;
        bottom.style.transform = `translate(-50%, -50%) rotateX(-90deg) translateZ(${height / 2}px)`;

        let bottomPoints = ['50% 50%'];
        for (let i = 0; i <= numSegments; i++) {
            const a = (startAngle + i * step) * Math.PI / 180;
            const x = 50 + 50 * Math.sin(a);
            const y = 50 - 50 * Math.cos(a);
            bottomPoints.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
        }
        bottom.style.clipPath = `polygon(${bottomPoints.join(', ')})`;
        tier.appendChild(bottom);

        const sideWalls = document.createElement('div');
        sideWalls.className = 'tier-side-walls';
        tier.appendChild(sideWalls);

        const chordLength = 2 * radius * Math.sin((step / 2) * Math.PI / 180);
        for (let i = 0; i < numSegments; i++) {
            const segment = document.createElement('div');
            segment.className = 'tier-side-segment';
            segment.style.width = `${chordLength + 1.5}px`;
            segment.style.height = `${height}px`;
            if (sideImgs && sideImgs.length > 0) {
                segment.style.backgroundImage = `url('${sideImgs[i % sideImgs.length]}')`;
            } else {
                segment.style.backgroundColor = '#fff';
            }
            const a = startAngle + step / 2 + i * step;
            segment.style.transform = `translate(-50%, -50%) rotateY(${a}deg) translateZ(${radius}px)`;
            sideWalls.appendChild(segment);
        }

        const leftCut = document.createElement('div');
        leftCut.className = 'tier-side-segment';
        leftCut.style.width = `${radius}px`;
        leftCut.style.height = `${height}px`;
        if (innerImgLeft) leftCut.style.backgroundImage = `url('${innerImgLeft}')`;
        leftCut.style.transform = `translate(-50%, -50%) rotateY(${startAngle}deg) translateZ(${radius / 2}px) rotateY(-90deg)`;
        sideWalls.appendChild(leftCut);

        const rightCut = document.createElement('div');
        rightCut.className = 'tier-side-segment';
        rightCut.style.width = `${radius}px`;
        rightCut.style.height = `${height}px`;
        if (innerImgRight) rightCut.style.backgroundImage = `url('${innerImgRight}')`;
        rightCut.style.transform = `translate(-50%, -50%) rotateY(${startAngle + angle}deg) translateZ(${radius / 2}px) rotateY(90deg)`;
        sideWalls.appendChild(rightCut);

        return tier;
    };

    const transformToSlice = () => {
        if (!cakePivot) return;
        cakePivot.innerHTML = '';

        const shuffledImages = [...images].sort(() => Math.random() - 0.5);

        const baseTop = shuffledImages[0];
        const baseBottom = shuffledImages[1];
        const baseSideImgs = shuffledImages.slice(2, 10);
        const innerImgLeft = shuffledImages[10];
        const innerImgRight = shuffledImages[11];

        const topTop = shuffledImages[12];
        const topBottom = shuffledImages[13];
        const topSideImgs = shuffledImages.slice(14, 20);

        // LEFT HALF
        const leftPivot = document.createElement('div');
        leftPivot.style.position = 'absolute';
        leftPivot.style.width = '100%';
        leftPivot.style.height = '100%';
        leftPivot.style.transformStyle = 'preserve-3d';
        leftPivot.style.transform = `rotateY(${-currentRotY - 90}deg)`;
        leftPivot.style.transition = 'transform 1.5s ease-in';

        const leftTierBase = createSliceTier(240, 160, 180, 12, 80, baseTop, baseBottom, baseSideImgs, innerImgLeft, innerImgRight);
        const leftTierTop = createSliceTier(160, 120, 180, 8, -60, topTop, topBottom, topSideImgs, innerImgLeft, innerImgRight);
        leftPivot.appendChild(leftTierBase);
        leftPivot.appendChild(leftTierTop);
        cakePivot.appendChild(leftPivot);

        // RIGHT HALF
        const rightPivot = document.createElement('div');
        rightPivot.style.position = 'absolute';
        rightPivot.style.width = '100%';
        rightPivot.style.height = '100%';
        rightPivot.style.transformStyle = 'preserve-3d';
        rightPivot.style.transform = `rotateY(${-currentRotY + 90}deg)`;
        rightPivot.style.transition = 'transform 1.5s ease-in';

        const rightTierBase = createSliceTier(240, 160, 180, 12, 80, baseTop, baseBottom, baseSideImgs, innerImgLeft, innerImgRight);
        const rightTierTop = createSliceTier(160, 120, 180, 8, -60, topTop, topBottom, topSideImgs, innerImgLeft, innerImgRight);
        rightPivot.appendChild(rightTierBase);
        rightPivot.appendChild(rightTierTop);
        cakePivot.appendChild(rightPivot);

        // Animate separation
        setTimeout(() => {
            leftPivot.style.transform = `rotateY(${-currentRotY - 90}deg) translateZ(120px) rotateY(15deg) translateY(50px)`;
            leftPivot.classList.add('fade-out-leaves');

            rightPivot.style.transform = `rotateY(${-currentRotY + 90}deg) translateZ(120px) rotateY(-15deg) translateY(50px)`;
            rightPivot.classList.add('fade-out-leaves');
        }, 50);

        // After halves disappear, clear the container
        setTimeout(() => {
            cakePivot.innerHTML = ''; // Remove halves completely
            document.querySelector('.cake-scene').style.display = 'none';

            // Show the GIF and Status Text
            const gifOverlay = document.createElement('div');
            gifOverlay.className = 'gif-overlay';
            gifOverlay.innerHTML = `
                <div class="gif-container">
                    <div class="gif-status-text"></div>
                    <img src="https://i.pinimg.com/originals/35/ec/d0/35ecd0734d233cb22f0307fdbe5ab0f4.gif">
                </div>
            `;
            document.body.appendChild(gifOverlay);

            const statusText = gifOverlay.querySelector('.gif-status-text');
            const messages = ["Đợi tý đang viết thư...", "Gần xong rồi", "......", "Xong rồi Baby"];

            const startSequence = async () => {
                for (const msg of messages) {
                    statusText.innerHTML = '';
                    for (let i = 0; i < msg.length; i++) {
                        statusText.innerHTML += msg.charAt(i);
                        await new Promise(r => setTimeout(r, 80));
                    }
                    await new Promise(r => setTimeout(r, 1000));
                }

                // Done with sequence
                setTimeout(() => {
                    gifOverlay.style.opacity = '0';
                    setTimeout(() => {
                        gifOverlay.remove();
                        showLetter();
                    }, 500);
                }, 500);
            };

            startSequence();
        }, 1500);
    };

    const showLetter = async () => {
        let birthday = '.. - .. - 2026';
        let message = 'Vậy là đến ngày đặc biệt của em rồi nè 💖 Chúc mừng sinh nhật cô gái siêu đáng yêu của anh. Anh mong tuổi mới sẽ mang đến cho em thật nhiều niềm vui, thật nhiều tiếng cười và những điều dễ thương nhất trên đời. Mong em luôn xinh đẹp, luôn hạnh phúc, luôn ngủ đủ giấc và ngày nào cũng cười thật nhiều. Anh biết đôi lúc anh còn hơi khờ, hơi nhây và cũng hay làm em giận nữa 🥹. Nhưng cảm ơn em vì vẫn luôn ở bên anh, chịu đựng anh, quan tâm anh và thương anh nhiều đến vậy. Tuổi mới rồi, chỉ mong em luôn bình an, làm điều mình thích và lúc nào cũng cảm thấy mình được yêu thương thật nhiều.Happy Birthday người anh thương 💕🎂';
        try {
            const response = await fetch('style/information.txt');
            const text = await response.text();
            const bdayMatch = text.match(/birthday=(.*)/);
            if (bdayMatch) birthday = bdayMatch[1].trim();

            const msgMatch = text.match(/message='([\s\S]*?)'/);
            if (msgMatch) message = msgMatch[1].trim();
        } catch (e) {
            console.error("Could not fetch information.txt", e);
        }

        const letterContainer = document.createElement('div');
        letterContainer.className = 'letter-container';

        const randomImages = [...images].sort(() => Math.random() - 0.5).slice(0, 3);
        const photoHtml = randomImages.map(img => `<div class="letter-photo"><img src="${img}"></div>`).join('');

        letterContainer.innerHTML = `
            <div class="letter-paper">
                <div class="letter-seal"><i class="fas fa-heart"></i></div>
                <div class="close-letter">x</div>
                <div class="letter-content"></div>
                <div class="letter-photos">${photoHtml}</div>
                <div class="letter-footer">
                    <div class="happy-birthday-effect">Happy Birthday!<br>${birthday}</div>
                </div>
            </div>
        `;

        document.body.appendChild(letterContainer);
        initFloatingHearts(letterContainer, 20, true); // Add background hearts ON TOP of the letter screen

        const contentDiv = letterContainer.querySelector('.letter-content');
        const closeBtn = letterContainer.querySelector('.close-letter');


        // Zoom photos logic
        const overlay = document.createElement('div');
        overlay.className = 'zoom-overlay';
        overlay.innerHTML = `
            <div class="zoomed-photo-frame">
                <div class="zoom-btn prev-btn"><i class="fas fa-chevron-left"></i></div>
                <img>
                <div class="zoom-btn next-btn"><i class="fas fa-chevron-right"></i></div>
            </div>
        `;
        document.body.appendChild(overlay);
        const zoomedImg = overlay.querySelector('img');
        const prevBtn = overlay.querySelector('.prev-btn');
        const nextBtn = overlay.querySelector('.next-btn');

        let currentZoomIndex = 0;

        const updateZoomPhoto = (index) => {
            currentZoomIndex = (index + images.length) % images.length;
            zoomedImg.style.opacity = '0';
            setTimeout(() => {
                zoomedImg.src = images[currentZoomIndex];
                zoomedImg.style.opacity = '1';
            }, 200);
        };

        const photoElements = letterContainer.querySelectorAll('.letter-photo');
        photoElements.forEach((photo) => {
            photo.addEventListener('click', (e) => {
                e.stopPropagation();
                const src = photo.querySelector('img').src;
                // Find index in original images array
                const imgIndex = images.findIndex(img => src.includes(img));
                updateZoomPhoto(imgIndex !== -1 ? imgIndex : 0);
                overlay.classList.add('show');
            });
        });

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateZoomPhoto(currentZoomIndex - 1);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateZoomPhoto(currentZoomIndex + 1);
        });

        overlay.addEventListener('click', () => {
            overlay.classList.remove('show');
        });

        // Continuously launch balloons while the letter is open
        const balloonColors = ['#ff6b81', '#ff4757', '#74b9ff', '#55efc4', '#fab1a0', '#a29bfe', '#fdcb6e', '#ffeaa7'];
        const balloonInterval = setInterval(() => {
            if (!document.body.contains(letterContainer)) {
                clearInterval(balloonInterval);
                return;
            }
            // Launch 1-2 balloons every 1.5 seconds for a steady flow
            for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
                setTimeout(() => {
                    const balloon = document.createElement('div');
                    balloon.className = 'photo-balloon';
                    const randomImg = images[Math.floor(Math.random() * images.length)];
                    const size = Math.random() * 50 + 70;
                    const left = Math.random() * 90 + 5;
                    const duration = Math.random() * 5 + 10; // Slow and elegant
                    const rot = Math.random() * 40 - 20;
                    const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];

                    balloon.style.backgroundImage = `url('${randomImg}')`;
                    balloon.style.width = `${size}px`;
                    balloon.style.height = `${size * 1.25}px`;
                    balloon.style.left = `${left}%`;
                    balloon.style.setProperty('--duration', `${duration}s`);
                    balloon.style.setProperty('--rot', `${rot}deg`);
                    balloon.style.setProperty('--color', color);

                    balloon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        balloon.classList.add('popping');
                        setTimeout(() => balloon.remove(), 300);
                    });

                    document.body.appendChild(balloon);
                    setTimeout(() => {
                        if (document.body.contains(balloon)) balloon.remove();
                    }, duration * 1000);
                }, Math.random() * 1500);
            }
        }, 2000);

        // Continuously change fan photos every 2s
        const fanPhotos = letterContainer.querySelectorAll('.letter-photo img');
        const fanInterval = setInterval(() => {
            if (!document.body.contains(letterContainer)) {
                clearInterval(fanInterval);
                return;
            }
            fanPhotos.forEach(img => {
                const randomImg = images[Math.floor(Math.random() * images.length)];
                img.style.transition = 'opacity 0.5s ease-in-out';
                img.style.opacity = '0';
                setTimeout(() => {
                    img.src = randomImg;
                    img.style.opacity = '1';
                }, 500);
            });
        }, 2000);

        let i = 0;
        let isTypewriterDone = false;
        let typewriterTimeout;
        const speed = 50;

        const typeWriter = () => {
            if (i < message.length) {
                const char = message.charAt(i);
                if (char === '\n') {
                    contentDiv.innerHTML += '<br>';
                } else {
                    contentDiv.innerHTML += char;
                }
                i++;
                contentDiv.scrollTop = contentDiv.scrollHeight;
                typewriterTimeout = setTimeout(typeWriter, speed);
            } else {
                isTypewriterDone = true;
            }
        };

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            letterContainer.classList.add('closing');

            setTimeout(() => {
                letterContainer.style.display = 'none';
                letterContainer.classList.remove('closing');

                // Show closed GIF
                const closedGif = document.createElement('div');
                closedGif.className = 'closed-letter-gif';
                closedGif.innerHTML = `<img src="https://i.pinimg.com/originals/ec/11/4e/ec114e0f57def79e7302c393e6fb3446.gif">`;
                document.body.appendChild(closedGif);

                closedGif.addEventListener('click', () => {
                    closedGif.classList.add('opening-gif');
                    setTimeout(() => {
                        closedGif.remove();
                        letterContainer.style.display = 'block';
                        letterContainer.classList.add('opening');
                        setTimeout(() => letterContainer.classList.remove('opening'), 1000);

                        if (!isTypewriterDone) {
                            // Reset and replay if not finished
                            i = 0;
                            contentDiv.innerHTML = '';
                            if (typewriterTimeout) clearTimeout(typewriterTimeout);
                            typeWriter();
                        }
                    }, 400);
                });
            }, 550);
        });

        // Trigger reflow for animation
        letterContainer.offsetHeight;
        letterContainer.classList.add('show');

        // Start typewriter after a small delay
        setTimeout(typeWriter, 1000);
    };

    const init3DCake = () => {
        if (!cakePivot) return;
        cakePivot.innerHTML = '';

        // 3D Candle
        const candle3D = createCylinder('candle-3d', 12, 60, 6, '', '', []);
        candle3D.style.transform = 'translate(-50%, -50%) translateY(-130px)';
        cakePivot.appendChild(candle3D);

        // 3D Flame
        const flamePos = document.createElement('div');
        flamePos.className = 'flame-pos';
        flamePos.style.position = 'absolute';
        flamePos.style.top = '50%';
        flamePos.style.left = '50%';
        flamePos.style.width = '0';
        flamePos.style.height = '0';
        flamePos.style.marginTop = `-${140 + 22}px`;
        flamePos.style.transformStyle = 'preserve-3d';

        [0, 60, 120].forEach(angle => {
            const face = document.createElement('div');
            face.className = 'flame';
            face.style.position = 'absolute';
            face.style.width = '14px';
            face.style.height = '26px';
            face.style.marginLeft = '-7px';
            face.style.marginTop = '-26px';
            face.style.setProperty('--angle', `${angle}deg`);
            face.style.cursor = 'pointer';
            face.addEventListener('click', (e) => {
                e.stopPropagation();
                isSlice = true; // Stop rotation immediately
                const flames = document.querySelectorAll('.flame');
                flames.forEach(f => f.style.display = 'none');

                const slash = document.createElement('div');
                slash.className = 'slash-line';
                document.body.appendChild(slash);

                slash.style.animation = 'slashDown 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards';

                setTimeout(() => {
                    transformToSlice();
                }, 1500);

                setTimeout(() => {
                    slash.remove();
                }, 1600);
            });
            flamePos.appendChild(face);
        });

        cakePivot.appendChild(flamePos);

        const shuffledImages = [...images].sort(() => Math.random() - 0.5);

        const baseTop = shuffledImages[0];
        const baseBottom = shuffledImages[1];
        const baseSideImgs = shuffledImages.slice(2, 14);

        const topTop = shuffledImages[14];
        const topBottom = shuffledImages[15];
        const topSideImgs = shuffledImages.slice(16, 22).concat(shuffledImages.slice(0, 10));

        cakePivot.appendChild(createCylinder('tier-base', 480, 160, 24, baseTop, baseBottom, baseSideImgs));
        cakePivot.appendChild(createCylinder('tier-top-part', 320, 120, 18, topTop, topBottom, shuffledImages.slice(2, 20)));
    };

    const initClouds = () => {
        const cloudsContainer = document.querySelector('.clouds-container');
        if (!cloudsContainer) return;
        cloudsContainer.innerHTML = '';
        const count = 4;
        for (let i = 0; i < count; i++) {
            const cloud = document.createElement('img');
            cloud.className = 'cloud';
            cloud.src = 'style/cloud.png';
            const top = Math.random() * 60 + 5; // Random height 5-65%
            const duration = Math.random() * 20 + 30; // Slow drift
            const delay = Math.random() * -duration; // Start mid-animation

            cloud.style.setProperty('--top', `${top}%`);
            cloud.style.setProperty('--duration', `${duration}s`);
            cloud.style.animationDelay = `${delay}s`;
            cloudsContainer.appendChild(cloud);
        }
    };

    const handleStart = (e) => {
        isDragging = true;
        startX = e.pageX || (e.touches && e.touches[0].pageX);
        startY = e.pageY || (e.touches && e.touches[0].pageY);
    };

    const handleMove = (e) => {
        if (!isDragging) return;
        if (e.type === 'touchmove') e.preventDefault();
        const x = e.pageX || (e.touches && e.touches[0].pageX);
        const y = e.pageY || (e.touches && e.touches[0].pageY);
        const deltaX = x - startX;
        const deltaY = y - startY;
        currentRotY += deltaX * 0.5;
        currentRotX -= deltaY * 0.5;
        currentRotX = Math.max(-45, Math.min(45, currentRotX));
        if (cakePivot) {
            cakePivot.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
        }
        startX = x; startY = y;
    };

    const handleEnd = () => { isDragging = false; };

    if (cakeMain) {
        cakeMain.addEventListener('mousedown', handleStart);
        cakeMain.addEventListener('touchstart', handleStart, { passive: false });
    }
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('mouseleave', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    // Prevent default drag behaviors to avoid getting stuck
    document.addEventListener('dragstart', (e) => e.preventDefault());

    const resizeCake = () => {
        const scene = document.querySelector('.cake-scene');
        if (!scene) return;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        // Base width: 550px, height: 800px approx
        const scaleX = screenWidth / 550;
        const scaleY = screenHeight / 800;
        let scale = Math.min(scaleX, scaleY, 1.2); // max scale 1.2
        if (scale < 0.3) scale = 0.3; // min scale 0.3
        scene.style.transform = `scale(${scale})`;
    };
    window.addEventListener('resize', resizeCake);
    resizeCake();

    function program(delay = 200) {
        (function () {
            const _b = (s) => decodeURIComponent(escape(atob(s)));
            const _d = [
                "QuG6o24gcXV54buBbiB0aHXhu5ljIHbhu4IgRHIuR2lmdGVy",
                "VGlrdG9rOiBodHRwczovL3d3dy50aWt0b2suY29tL0Bkci5naWZ0ZXIzMDY=",
                "R2l0aHViOiBodHRwczovL2dpdGh1Yi5jb20vRHJHaWZ0ZXI="
            ];

            setTimeout(() => {
                _d.forEach(x => console.log(_b(x)));
            }, delay);
        })();
    }

    program();

    const initFloatingHearts = (container, count = 15, onTop = false) => {
        if (!container) return;

        for (let i = 0; i < count; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = '♥';
            heart.style.position = 'absolute';
            // Use pinker color and higher opacity if on top of the letter
            heart.style.color = onTop ? 'rgba(255, 71, 87, 0.5)' : 'rgba(255, 255, 255, 0.4)';
            heart.style.fontSize = Math.random() * 40 + 20 + 'px';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.top = '100%'; // Start from bottom
            heart.style.opacity = Math.random() * 0.4 + 0.2;
            heart.style.pointerEvents = 'none';
            const duration = Math.random() * 5 + 5;
            heart.style.animation = `floatUp ${duration}s linear infinite`;
            // Use negative delay to make them appear already moving at different stages
            heart.style.animationDelay = `-${Math.random() * duration}s`;
            heart.style.zIndex = onTop ? '1000' : '1';
            container.appendChild(heart);
        }
    };

    // Initialize cake
    document.body.style.overflow = 'hidden';
    initClouds();
    init3DCake();
    initFloatingHearts(document.getElementById('gift-screen'));
    updateRotation();

    // Continuously change images on faces
    setInterval(() => {
        const faces = document.querySelectorAll('.tier-top, .tier-bottom, .tier-side-segment');
        const imageFaces = Array.from(faces).filter(face => face.style.backgroundImage && face.style.backgroundImage !== 'none');
        if (imageFaces.length > 0) {
            const randomFace = imageFaces[Math.floor(Math.random() * imageFaces.length)];
            const randomImg = images[Math.floor(Math.random() * images.length)];
            randomFace.style.transition = 'background-image 0.4s ease-in-out';
            randomFace.style.backgroundImage = `url('${randomImg}')`;
        }
    }, 200);

    // Gift Box Logic
    const giftScreen = document.getElementById('gift-screen');
    const giftBox = document.getElementById('gift-box');
    const bgMusic = new Audio('style/nhac.mp3');
    bgMusic.loop = true;

    if (giftBox && giftScreen) {
        giftBox.addEventListener('click', () => {
            bgMusic.play().catch(err => console.log("Music play blocked:", err));
            giftScreen.style.opacity = '0';
            giftScreen.style.visibility = 'hidden';

            // Show cake and clouds
            if (cakeMain) {
                cakeMain.style.visibility = 'visible';
                cakeMain.style.opacity = '1';
            }
            const cloudsContainer = document.querySelector('.clouds-container');
            if (cloudsContainer) {
                cloudsContainer.style.visibility = 'visible';
                cloudsContainer.style.opacity = '1';
            }

            setTimeout(() => {
                giftScreen.remove();
            }, 1000);
        });
    }
});

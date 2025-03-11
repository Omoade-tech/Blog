<template>
    <div class="about-page container px-0">
        <div class="hero-section row g-0 align-items-center mb-5">
            <div class="col-md-6 order-md-2">
                <img 
                    src="../assets/image/wmremove-transformed-removebg-preview.png" 
                    alt="About Us Hero Image" 
                    class="img-fluid rounded shadow-lg"
                >
            </div>
            <div class="col-md-6 order-md-1 px-4 py-5">
                <h1 class="display-2 text-light mb-3">About Our Blog</h1>
                <p class=" story">
                    Discover the story behind our passion for sharing knowledge
                </p>
            </div>
        </div>
        
        <div class="about-content container">
            <div class="row g-4">
                <div class="col-12 col-md-6 mb-4">
                    <div class="card h-100 d-flex flex-column flex-md-row">
                        <img 
                            src="../assets/image/image5-removebg-preview.png" 
                            alt="Our Journey" 
                            class="img-fluid mx-auto d-block"
                            style="width: 150px; height: 150px; object-fit: contain;"
                        >
                        <div class="card-body text-center text-md-start">
                            <h2 class="card-title text-primary mb-3">Our Journey</h2>
                            <p class="card-text text-muted">
                                We are a team of passionate writers and tech enthusiasts dedicated to 
                                sharing insights, knowledge, and stories that inspire and educate.
                            </p>
                            <p class="card-text text-muted">
                                Our blog is more than just a platform - it's a community where ideas 
                                are shared, discussions are sparked, and learning never stops.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 col-md-6 mb-4">
                    <div class="card h-100 d-flex flex-column flex-md-row">
                        <img 
                            src="../assets/image/image3-removebg-preview.png" 
                            alt="Our Mission" 
                            class="img-fluid mx-auto d-block"
                            style="width: 150px; height: 150px; object-fit: contain;"
                        >
                        <div class="card-body text-center text-md-start">
                            <h2 class="card-title text-primary mb-3">Our Mission</h2>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex align-items-center">
                                    <i class="bi bi-check-circle text-success me-2"></i>
                                    Provide high-quality, informative content
                                </li>
                                <li class="list-group-item d-flex align-items-center">
                                    <i class="bi bi-check-circle text-success me-2"></i>
                                    Foster a community of continuous learning
                                </li>
                                <li class="list-group-item d-flex align-items-center">
                                    <i class="bi bi-check-circle text-success me-2"></i>
                                    Share diverse perspectives and insights
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="set-goals-section row g-0 align-items-center mb-5 bg-light">
                <div class="col-md-6 order-md-1 p-0">
                    <img 
                        src="../assets/image/rmimage1.png" 
                        alt="Our Set Goals" 
                        class="img-fluid w-100 h-100 object-fit-cover"
                    >
                </div>
                <div class="col-md-6 order-md-2 px-4 py-5">
                    <div class="container">
                        <h2 class="display-6 mb-4 text-primary">Our Set Goals</h2>
                        <div class="goals-list">
                            <div class="goal-item mb-3">
                                <h4 class="text-dark">
                                    <i class="bi bi-bullseye text-success me-2"></i>
                                    Continuous Learning
                                </h4>
                                <p class="text-muted">
                                    Commit to ongoing personal and professional development through 
                                    consistent knowledge sharing and skill enhancement.
                                </p>
                            </div>
                            <div class="goal-item mb-3">
                                <h4 class="text-dark">
                                    <i class="bi bi-graph-up text-primary me-2"></i>
                                    Community Growth
                                </h4>
                                <p class="text-muted">
                                    Build and nurture a vibrant, supportive community of learners 
                                    and content creators who inspire and motivate each other.
                                </p>
                            </div>
                            <div class="goal-item">
                                <h4 class="text-dark">
                                    <i class="bi bi-star text-warning me-2"></i>
                                    Quality and Innovation
                                </h4>
                                <p class="text-muted">
                                    Consistently deliver high-quality, innovative content that 
                                    pushes the boundaries of traditional blogging.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AboutPage',
    data() {
        return {}
    }
}
</script>

<style scoped>
.hero-section {
    background-image: url('../assets/image/aboutbg.jpeg');
    background-repeat: no-repeat;
    background-size: cover;
}

.card {
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-10px);
}
.story{

    color: #ddd;
    /* font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif; */
    font-weight: 900;
     text-shadow: 5px 5px 5px #000000;
     width: 80%;
     margin-top: -15px;
}

@media (max-width: 767px) {
    .card {
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
    }

    .card img {
        margin-bottom: 1rem;
    }

    .card-body {
        text-align: center !important;
    }
}

.set-goals-section {
    border-top: 1px solid #e9ecef;
    border-bottom: 1px solid #e9ecef;
}

.goal-item {
    position: relative;
    padding-left: 20px;
}

.goal-item h4 {
    margin-bottom: 0.5rem;
}

.goal-item i {
    position: absolute;
    left: 0;
    top: 5px;
    font-size: 1.2rem;
}
</style>
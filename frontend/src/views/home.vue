<template>
    <div>
        <section class="hero-section bg-primary text-white py-5">
            <div class="container">
                <div class="hero-content row align-items-center">
                    <div class="col-md-6 order-md-2 animate__animated animate__fadeInRight">
                        <img src="../assets/image/image.png" alt="blog Hero" class="img-fluid rounded" />
                    </div>
                    <div class="col-md-6 order-md-1 animate__animated animate__fadeInLeft">
                        <h1 class="display-4 text-white mb-3">Welcome to Cruiz-blog</h1>
                        <p class="lead mb-4">
                            The home for Developers searching for blog about software developer opportunities around the world.
                            There are thousands of jobs here.
                        </p>
                        <Search />
                    </div>
                </div>
            </div>
        </section>
        
        <section class="blog-importance-section bg-light py-5">
            <div class="container">
                <div class="importance-content row align-items-center">
                    <div class="col-md-6 animate__animated animate__fadeInLeft">
                        <h2 class="mb-4">Why Choose Cruiz-blog?</h2>
                        <ul class="list-unstyled">
                            <li class="mb-2"><span class="me-2">🌐</span> Global Job Opportunities</li>
                            <li class="mb-2"><span class="me-2">📚</span> Comprehensive Developer Resources</li>
                            <li class="mb-2"><span class="me-2">🚀</span> Career Growth Insights</li>
                            <li class="mb-2"><span class="me-2">💡</span> Latest Industry Trends</li>
                        </ul>
                        <p class="text-muted">
                            Cruiz-blog is your ultimate platform for developers seeking meaningful career opportunities 
                            and staying updated with the latest tech industry insights.
                        </p>
                    </div>
                    <div class="col-md-6 animate__animated animate__fadeInRight">
                        <img src="../assets/image/image1-removebg-preview.png" alt="Blog Importance" class="img-fluid rounded" />
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
export default {
    name: 'HomePage'
}
</script>

<style scoped>
/* Minimal custom styles to complement Bootstrap */
.hero-section {
    background-image: url("../assets/image/background.jpeg");
    background-size: cover;
}
</style>
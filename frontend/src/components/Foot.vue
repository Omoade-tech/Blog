<template>
  <footer class="text-muted py-5">
    <div class="container">
      <div class="row g-4">
        <div class="col-md-3">
          <h5 class="text-dark mb-3">Cruiz-blog</h5>
          <p class="small">Your ultimate platform for developers seeking meaningful career opportunities and staying updated with the latest tech industry insights.</p>
        </div>
        
        <div class="col-md-3">
          <h5 class="text-dark mb-3">Quick Links</h5>
          <ul class="list-unstyled">
            <li class="mb-2"><a href="/" class="text-muted text-decoration-none">Home</a></li>
            <li class="mb-2"><a href="/blogs" class="text-muted text-decoration-none">Blogs</a></li>
            <li class="mb-2"><a href="/jobs" class="text-muted text-decoration-none">Job Opportunities</a></li>
            <li class="mb-2"><a href="/contact" class="text-muted text-decoration-none">Contact</a></li>
          </ul>
        </div>
        
        <div class="col-md-3">
          <h5 class="text-dark mb-3">Contact Us</h5>
          <p class="small mb-2">Email: support@cruiz-blog.com</p>
          <p class="small">Phone: +1 (555) 123-4567</p>
        </div>
        
        <div class="col-md-3">
          <h5 class="text-dark mb-3">Follow Us</h5>
          <div class="d-flex gap-3">
            <a href="https://twitter.com/cruizblog" target="_blank" class="text-muted">
              <i class="fab fa-twitter fs-4"></i>
            </a>
            <a href="https://linkedin.com/company/cruiz-blog" target="_blank" class="text-muted">
              <i class="fab fa-linkedin fs-4"></i>
            </a>
            <a href="https://github.com/cruiz-blog" target="_blank" class="text-muted">
              <i class="fab fa-github fs-4"></i>
            </a>
            <a href="https://instagram.com/cruizblog" target="_blank" class="text-muted">
              <i class="fab fa-instagram fs-4"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div class="border-top mt-4 pt-3 text-center">
        <p class="small mb-0">&copy; {{ currentYear }} Cruiz-blog. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Foot',
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
};
</script>

<style scoped>

a:hover {
  color: #007bff !important;
}
footer{
  background-color: #ddd;
}
</style>
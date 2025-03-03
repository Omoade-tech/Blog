<template>
    <section class="footer-section">
      <div class="container">
        <div class="row">
          <div class="col-md-12 text-center">
            <!-- &copy; Job Portal {{ currentYear }} -->
            &copy; Job Portal @2024

            <p>All rights reserved | {{ currentYear }}</p>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: "Footer",
    data() {
      return {
        currentYear: new Date().getFullYear(), 
      };
    },
  };
  </script>
  
  <style scoped>
  .footer-section {
    background-color: #f8f9fa;
    padding: 1rem 0;
    font-size: 0.9rem;
    color: #6c757d;

  }
  </style>
  
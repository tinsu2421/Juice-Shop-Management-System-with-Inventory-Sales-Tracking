from django.db import models
from products.models import Product


class Recipe(models.Model):
    juice_product = models.OneToOneField(
        Product, on_delete=models.CASCADE, related_name='recipe',
        limit_choices_to={'category__type': 'juice'}
    )
    description = models.TextField(blank=True)
    yield_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1,
                                         help_text='How many units this recipe produces')

    def __str__(self):
        return f"Recipe for {self.juice_product.name}"


class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    ingredient = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='used_in_recipes')
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=20, default='kg')

    def __str__(self):
        return f"{self.quantity}{self.unit} {self.ingredient.name}"

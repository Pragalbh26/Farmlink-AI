import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

def evaluate_model_performance(model_path: str, test_generator):
    """
    Evaluates saved MobileNetV2 model against hold-out test dataset.
    """
    model = tf.keras.models.load_model(model_path)
    predictions = model.predict(test_generator)
    y_pred = np.argmax(predictions, axis=1)
    y_true = test_generator.classes
    
    report = classification_report(y_true, y_pred, target_names=list(test_generator.class_indices.keys()))
    cm = confusion_matrix(y_true, y_pred)
    
    print("Classification Report:\n", report)
    return report, cm

if __name__ == "__main__":
    print("Model evaluation pipeline ready.")
